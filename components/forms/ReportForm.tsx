"use client";

import { useState, useTransition } from "react";
import { createReport } from "@/lib/supabase/actions";
import type { ActionResult, ReportTargetType } from "@/lib/supabase/types";
import { ResultMessage, TextAreaField, TextField } from "./FormControls";

export function ReportForm({ targetId, targetType, compact = true }: { targetId: string; targetType: ReportTargetType; compact?: boolean }) {
  const [open, setOpen] = useState(!compact);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  if (!open) return <button onClick={() => setOpen(true)} className="mt-5 w-full py-2 text-xs text-[#a28f83]">举报不合适内容</button>;
  return (
    <form action={(formData) => startTransition(async () => setResult(await createReport(formData)))} className="mt-5 rounded-[20px] border border-[#e7dbcf] bg-[#fffdf8] p-4">
      <input type="hidden" name="targetId" value={targetId} /><input type="hidden" name="targetType" value={targetType} />
      <div className="space-y-4"><TextField label="举报原因" name="reason" required placeholder="例如：信息不实、隐私泄露" /><TextAreaField label="补充说明" name="detail" /><ResultMessage result={result} /></div>
      <div className="mt-4 flex gap-3"><button disabled={pending} className="flex-1 rounded-[16px] bg-[#7b2d26] px-4 py-3 text-xs font-semibold text-white">{pending ? "提交中..." : "提交举报"}</button><button type="button" onClick={() => setOpen(false)} className="rounded-[16px] px-4 py-3 text-xs text-[#8c796d]">取消</button></div>
    </form>
  );
}
