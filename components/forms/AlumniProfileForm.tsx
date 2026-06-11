"use client";

import { useState, useTransition } from "react";
import { submitAlumniProfile } from "@/lib/supabase/actions";
import type { ActionResult, AlumniProfile } from "@/lib/supabase/types";
import { CheckField, ResultMessage, TextAreaField, TextField } from "./FormControls";

export function AlumniProfileForm({ initial }: { initial: AlumniProfile | null }) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    startTransition(async () => setResult(await submitAlumniProfile(formData)));
  }
  return (
    <form action={submit} className="space-y-6">
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
