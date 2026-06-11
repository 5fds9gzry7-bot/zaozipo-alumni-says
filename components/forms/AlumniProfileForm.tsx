"use client";

import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult, AlumniProfile } from "@/lib/supabase/types";
import { CheckField, ResultMessage, TextAreaField, TextField } from "./FormControls";

export function AlumniProfileForm({ initial }: { initial: AlumniProfile | null }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setPending(true);
    setResult(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setResult({ ok: false, message: "Supabase 环境变量未配置，暂时无法保存名片。" });
        return;
      }

      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) {
        setResult({ ok: false, message: "登录状态已失效，请重新登录后再保存。" });
        return;
      }

      const formData = new FormData(form);
      const payload = alumniPayload(formData, auth.user.id);
      const { data: existing, error: existingError } = await supabase.from("alumni_profiles").select("id").eq("user_id", auth.user.id).maybeSingle();
      if (existingError) throw existingError;

      const { error } = existing
        ? await supabase.from("alumni_profiles").update(payload).eq("user_id", auth.user.id)
        : await supabase.from("alumni_profiles").insert(payload);
      if (error) throw error;

      setResult({ ok: true, message: "枣友名片已保存并公开展示。" });
    } catch (saveError) {
      setResult({ ok: false, message: saveError instanceof Error ? saveError.message : "保存名片失败，请稍后重试。" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <FormSection title="基本信息">
        <TextField label="昵称 / 姓名" name="display_name" required defaultValue={initial?.display_name} />
        <TextField label="毕业年份" name="graduation_year" type="number" required defaultValue={initial?.graduation_year} />
        <TextField label="当年班级（可选）" name="class_name" defaultValue={initial?.class_name ?? ""} />
        <TextField label="当前大学 / 机构" name="university" required defaultValue={initial?.university} />
        <TextField label="学院" name="college" defaultValue={initial?.college ?? ""} />
        <TextField label="专业" name="major" required defaultValue={initial?.major} />
        <TextField label="所在城市" name="city" required defaultValue={initial?.city} />
        <TextField label="国家 / 地区" name="country" required defaultValue={initial?.country ?? "中国"} />
        <TextField label="学历 / 职业阶段" name="stage" required defaultValue={initial?.stage} />
        <TextField label="研究 / 职业方向" name="direction" defaultValue={initial?.direction ?? ""} />
        <TextField label="标签（逗号分隔）" name="tags" defaultValue={initial?.tags.join("，")} />
        <TextAreaField label="一句话介绍" name="intro" required defaultValue={initial?.intro} />
      </FormSection>
      <FormSection title="高考与升学参考">
        <TextField label="高考年份" name="gaokao_year" type="number" defaultValue={initial?.gaokao_year ?? ""} />
        <TextField label="高考省份" name="gaokao_province" defaultValue={initial?.gaokao_province ?? "湖南"} />
        <TextField label="科类" name="gaokao_type" defaultValue={initial?.gaokao_type ?? ""} />
        <TextField label="高考总分" name="gaokao_score" type="number" defaultValue={initial?.gaokao_score ?? ""} />
        <TextField label="高考位次" name="gaokao_rank" type="number" defaultValue={initial?.gaokao_rank ?? ""} />
        <div className="grid grid-cols-2 gap-3"><CheckField name="show_score" label="公开分数" defaultChecked={initial?.show_score} /><CheckField name="show_rank" label="公开位次" defaultChecked={initial?.show_rank} /></div>
        <TextField label="录取大学" name="admitted_university" defaultValue={initial?.admitted_university ?? ""} />
        <TextField label="录取专业" name="admitted_major" defaultValue={initial?.admitted_major ?? ""} />
      </FormSection>
      <FormSection title="经验分享">
        <TextAreaField label="高中学习方法" name="study_advice" defaultValue={initial?.study_advice ?? ""} />
        <TextAreaField label="高考备考经验" name="exam_advice" defaultValue={initial?.exam_advice ?? ""} />
        <TextAreaField label="志愿填报建议" name="application_advice" defaultValue={initial?.application_advice ?? ""} />
        <TextAreaField label="大学专业建议" name="major_advice" defaultValue={initial?.major_advice ?? ""} />
        <TextAreaField label="给学弟学妹的一句话" name="message_to_students" defaultValue={initial?.message_to_students ?? ""} />
        <TextField label="公开联系方式" name="contact" defaultValue={initial?.contact ?? ""} />
        <CheckField name="show_contact" label="自愿公开联系方式" defaultChecked={initial?.show_contact} />
      </FormSection>
      <ResultMessage result={result} />
      <button disabled={pending} className="w-full rounded-[18px] bg-[#7b2d26] px-5 py-4 text-sm font-semibold text-white shadow-md disabled:opacity-60">{pending ? "正在保存..." : "保存并公开名片"}</button>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-[0_8px_24px_rgba(76,47,37,0.05)]"><h2 className="mb-5 font-serif text-lg font-bold">{title}</h2><div className="space-y-5">{children}</div></section>;
}

function alumniPayload(formData: FormData, userId: string) {
  return {
    user_id: userId,
    display_name: text(formData, "display_name"),
    graduation_year: number(formData, "graduation_year"),
    class_name: text(formData, "class_name"),
    university: text(formData, "university"),
    college: text(formData, "college"),
    major: text(formData, "major"),
    city: text(formData, "city"),
    country: text(formData, "country") || "中国",
    stage: text(formData, "stage"),
    direction: text(formData, "direction"),
    tags: tags(formData),
    intro: text(formData, "intro"),
    gaokao_year: nullableNumber(formData, "gaokao_year"),
    gaokao_province: text(formData, "gaokao_province"),
    gaokao_type: text(formData, "gaokao_type"),
    gaokao_score: nullableNumber(formData, "gaokao_score"),
    gaokao_rank: nullableNumber(formData, "gaokao_rank"),
    show_score: formData.get("show_score") === "on",
    show_rank: formData.get("show_rank") === "on",
    admitted_university: text(formData, "admitted_university"),
    admitted_major: text(formData, "admitted_major"),
    study_advice: text(formData, "study_advice"),
    exam_advice: text(formData, "exam_advice"),
    application_advice: text(formData, "application_advice"),
    major_advice: text(formData, "major_advice"),
    message_to_students: text(formData, "message_to_students"),
    contact: text(formData, "contact"),
    show_contact: formData.get("show_contact") === "on",
    status: "published",
  };
}

function text(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }
function number(formData: FormData, name: string) { return Number(text(formData, name)); }
function nullableNumber(formData: FormData, name: string) { const value = text(formData, name); return value ? Number(value) : null; }
function tags(formData: FormData) { return text(formData, "tags").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean); }
