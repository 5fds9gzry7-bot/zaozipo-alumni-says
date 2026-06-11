"use client";

import { useState, useTransition } from "react";
import { adminHideAlumniProfile, adminHideArticle, adminPublishAlumniProfile, adminPublishArticle, adminResolveReport, adminSetUserBanned } from "@/lib/supabase/actions";
import type { ActionResult } from "@/lib/supabase/types";

type Props = {
  kind: "alumni" | "article" | "report" | "user"; id: string; title: string; detail: string;
  status?: string;
};

export function AdminReviewCard({ kind, id, title, detail, status }: Props) {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  function run(action: () => Promise<ActionResult>) { startTransition(async () => setResult(await action())); }
  function hide() {
    const note = window.prompt("请输入隐藏原因") || "管理员隐藏";
    run(() => kind === "alumni" ? adminHideAlumniProfile(id, note) : adminHideArticle(id, note));
  }
  function restore() { run(() => kind === "alumni" ? adminPublishAlumniProfile(id) : adminPublishArticle(id)); }
  return <article className="rounded-[22px] border border-[#e7dbcf] bg-[#fffdf8] p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[#f0e8dd] px-3 py-1.5 text-[10px] font-semibold text-[#7b2d26]">{kind}</span>{status && <span className="text-[10px] text-[#8c7b71]">{status}</span>}</div>
    <h3 className="mt-3 text-sm font-semibold text-[#503b33]">{title}</h3><p className="mt-2 text-xs leading-5 text-[#8c7b71]">{detail}</p>
    {result && <p className={`mt-3 text-xs ${result.ok ? "text-[#31594e]" : "text-[#7b2d26]"}`}>{result.message}</p>}
    <div className="mt-4 border-t border-[#eee5dc] pt-3">
      {kind === "report" && <button disabled={pending} onClick={() => run(() => adminResolveReport(id, "管理员已核查处理"))} className="w-full rounded-[14px] bg-[#31594e] px-3 py-2.5 text-xs font-semibold text-white">标记已处理</button>}
      {(kind === "article" || kind === "alumni") && <button disabled={pending} onClick={status === "hidden" ? restore : hide} className="w-full rounded-[14px] bg-[#7b2d26] px-3 py-2.5 text-xs font-semibold text-white">{status === "hidden" ? "恢复公开" : "隐藏内容"}</button>}
      {kind === "user" && <button disabled={pending} onClick={() => run(() => adminSetUserBanned(id, status !== "banned"))} className="w-full rounded-[14px] bg-[#7b2d26] px-3 py-2.5 text-xs font-semibold text-white">{status === "banned" ? "解除封禁" : "封禁用户"}</button>}
    </div>
  </article>;
}
