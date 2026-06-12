"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const questionnaireUrl = "https://form.wjx.com/vm/wdEJxS0.aspx";

export function QuestionnaireModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  useEffect(() => {
    if (!open) return;
    function close(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open, onClose]);

  async function copyQuestionnaireUrl() {
    try {
      await navigator.clipboard.writeText(questionnaireUrl);
      setCopyStatus("copied");
    } catch {
      const input = document.createElement("textarea");
      input.value = questionnaireUrl;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      setCopyStatus(copied ? "copied" : "failed");
    }
  }

  if (!open) return null;
  return <div role="dialog" aria-modal="true" aria-label="申请成为枣友" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2d211c]/60 px-5 backdrop-blur-sm" onClick={onClose}>
    <section className="w-full max-w-sm rounded-[28px] bg-[#fffdf8] p-6 text-center shadow-2xl" onClick={(event) => event.stopPropagation()}>
      <p className="text-[10px] font-semibold tracking-[0.2em] text-[#a08255]">ALUMNI QUESTIONNAIRE</p>
      <h2 className="mt-2 font-serif text-2xl font-bold text-[#3a2720]">申请成为枣友</h2>
      {imageFailed ? <div className="mx-auto mt-5 flex h-[220px] w-[220px] items-center justify-center rounded-[22px] border border-[#eadfd3] bg-[#f8f3eb] p-6 shadow-sm"><p className="font-serif text-base leading-8 text-[#7b2d26]">问卷暂未开放，<br />请联系管理员。</p></div> : <div className="mx-auto mt-5 w-fit rounded-[22px] border border-[#eadfd3] bg-white p-3 shadow-sm"><Image src="/questionnaire-wdEJxS0.png" alt="问卷星二维码" width={220} height={220} onError={() => setImageFailed(true)} className="h-[220px] w-[220px] rounded-[12px]" /></div>}
      <p className="mt-5 text-sm leading-7 text-[#6f5d53]">{imageFailed ? "问卷开放后，可在这里扫码填写校友信息与经验分享。" : "扫描二维码填写校友信息与经验分享，我们将在审核后发布。"}</p>
      <p className="mt-3 font-serif text-sm leading-7 text-[#7b2d26]">感谢分享你的经验，你的故事可能改变学弟学妹的人生。</p>
      <div className="mt-4 flex items-center gap-2 rounded-[14px] border border-[#e8ddd2] bg-[#f8f3eb] p-2 pl-3 text-left">
        <a href={questionnaireUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs text-[#7b2d26] underline underline-offset-2">{questionnaireUrl}</a>
        <button type="button" onClick={() => void copyQuestionnaireUrl()} className="shrink-0 rounded-[10px] bg-[#eadfd3] px-3 py-2 text-[11px] font-semibold text-[#6f4c43]">{copyStatus === "copied" ? "已复制" : copyStatus === "failed" ? "请长按复制" : "复制链接"}</button>
      </div>
      <a href={questionnaireUrl} target="_blank" rel="noreferrer" className="mt-4 block w-full rounded-[16px] bg-[#7b2d26] px-4 py-3 text-sm font-semibold text-white">打开问卷填写</a>
      <button type="button" onClick={onClose} className="mt-3 w-full rounded-[16px] border border-[#d8c8b8] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-[#6f5d53]">关闭</button>
    </section>
  </div>;
}
