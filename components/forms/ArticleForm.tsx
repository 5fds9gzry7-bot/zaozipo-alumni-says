"use client";

import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult } from "@/lib/supabase/types";
import { ResultMessage, TextAreaField, TextField } from "./FormControls";

export function ArticleForm() {
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
        setResult({ ok: false, message: "Supabase 环境变量未配置，暂时无法发布文章。" });
        return;
      }

      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) {
        setResult({ ok: false, message: "登录状态已失效，请重新登录后再发布。" });
        return;
      }

      const { data: profile, error: profileError } = await supabase.from("profiles").select("status").eq("id", auth.user.id).maybeSingle();
      if (profileError) throw profileError;
      if (!profile) throw new Error("未找到当前账号的个人资料，请稍后重试。");
      if (profile.status === "banned") {
        setResult({ ok: false, message: "当前账号已被封禁，暂时无法投稿。" });
        return;
      }

      const formData = new FormData(form);
      const content = text(formData, "content");
      const { data: alumniProfile, error: alumniError } = await supabase.from("alumni_profiles").select("id").eq("user_id", auth.user.id).maybeSingle();
      if (alumniError) throw alumniError;

      const { error } = await supabase.from("articles").insert({
        author_id: auth.user.id,
        alumni_profile_id: alumniProfile?.id ?? null,
        title: text(formData, "title"),
        excerpt: text(formData, "excerpt"),
        content,
        category: text(formData, "category"),
        tags: tags(formData),
        status: "published",
        read_time: `${Math.max(1, Math.ceil(content.length / 500))} 分钟`,
        published_at: new Date().toISOString(),
      });
      if (error) throw error;

      form.reset();
      setResult({ ok: true, message: "文章已发布，其他枣友现在可以看到它。" });
    } catch (publishError) {
      setResult({ ok: false, message: publishError instanceof Error ? publishError.message : "发布文章失败，请稍后重试。" });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-[0_9px_25px_rgba(76,47,37,0.06)]">
      <div className="space-y-5">
        <TextField label="文章标题" name="title" required />
        <TextField label="分类" name="category" required placeholder="高中学习、志愿填报、大学专业..." />
        <TextField label="标签（逗号分隔）" name="tags" />
        <TextAreaField label="文章摘要" name="excerpt" required maxLength={220} />
        <TextAreaField label="正文" name="content" required rows={16} placeholder="段落之间请空一行。" />
        <ResultMessage result={result} />
        <button disabled={pending} className="w-full rounded-[18px] bg-[#31594e] px-5 py-4 text-sm font-semibold text-white shadow-md disabled:opacity-60">{pending ? "正在发布..." : "直接发布文章"}</button>
      </div>
    </form>
  );
}

function text(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }
function tags(formData: FormData) { return text(formData, "tags").split(/[,，]/).map((tag) => tag.trim()).filter(Boolean); }
