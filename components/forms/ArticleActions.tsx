"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleArticleFavorite, toggleArticleLike } from "@/lib/supabase/actions";
import type { ActionResult } from "@/lib/supabase/types";
import { ReportForm } from "./ReportForm";

export function ArticleActions({ articleId, loggedIn, liked, favorited }: { articleId: string; loggedIn: boolean; liked: boolean; favorited: boolean }) {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  if (!loggedIn) return <div className="mt-6 rounded-[20px] bg-[#f2eadc] p-4 text-center text-xs leading-6 text-[#786558]">登录后可以点赞、收藏和举报。<Link href="/auth" className="ml-1 font-semibold text-[#7b2d26]">去登录 →</Link></div>;
  function run(action: () => Promise<ActionResult>) { startTransition(async () => setMessage((await action()).message)); }
  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button disabled={pending} onClick={() => run(() => toggleArticleLike(articleId))} className="rounded-[18px] bg-[#7b2d26] px-4 py-3.5 text-sm font-semibold text-white shadow-md disabled:opacity-60">{liked ? "取消点枣" : "点个枣"}</button>
        <button disabled={pending} onClick={() => run(() => toggleArticleFavorite(articleId))} className="rounded-[18px] border border-[#d9c9b9] bg-[#fffdf8] px-4 py-3.5 text-sm font-semibold text-[#604940] disabled:opacity-60">{favorited ? "移出枣篮" : "收藏到枣篮"}</button>
      </div>
      {message && <p className="mt-3 text-center text-xs text-[#817168]">{message}</p>}
      <ReportForm targetId={articleId} targetType="article" />
    </>
  );
}
