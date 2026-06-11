"use client";

import { useState, useTransition } from "react";
import { submitArticle } from "@/lib/supabase/actions";
import type { ActionResult } from "@/lib/supabase/types";
import { ResultMessage, TextAreaField, TextField } from "./FormControls";

export function ArticleForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) { startTransition(async () => setResult(await submitArticle(formData))); }
  return (
    <form action={submit} className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-[0_9px_25px_rgba(76,47,37,0.06)]">
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
