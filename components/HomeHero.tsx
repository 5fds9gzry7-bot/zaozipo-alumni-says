"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandMark } from "./BrandMark";
import { QuestionnaireModal } from "./QuestionnaireModal";

export function HomeHero() {
  const [open, setOpen] = useState(false);
  return <>
    <section className="hero-hills relative overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#6d2723_0%,#85342c_58%,#5f3029_100%)] px-6 pb-7 pt-6 text-white shadow-[0_20px_45px_rgba(91,39,34,0.24)]">
      <div className="relative z-10"><div className="relative min-h-20 pr-20"><div className="min-w-0"><p className="whitespace-nowrap text-[9px] font-semibold leading-5 tracking-[0.08em] text-[#ead1bd]">溆浦一中非官方精选校友经验库</p><h1 className="mt-4 whitespace-nowrap font-serif text-[29px] font-bold leading-tight">枣子坡校友说</h1></div><div className="absolute right-0 top-0"><BrandMark size="lg" inverted /></div></div>
        <p className="mt-5 max-w-[290px] text-sm leading-6 text-white/86">听学长学姐讲大学、专业、高考和成长经验。</p>
        <div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={() => setOpen(true)} className="rounded-[16px] bg-[#f1d9b2] px-3 py-3 text-xs font-bold text-[#682820]">申请成为枣友</button><Link href="/articles" className="rounded-[16px] border border-white/25 bg-white/10 px-3 py-3 text-center text-xs font-bold text-white">浏览经验文章</Link></div>
        <div className="mt-5 border-t border-white/15 pt-4"><div className="flex items-center gap-3"><span className="h-px w-7 bg-[#d8b06b]" /><p className="font-serif text-xs text-[#f2dfc9]">从枣子坡出发，看见更远的大学与世界。</p></div><p className="mt-3 text-[10px] leading-5 text-white/60">所有校友经验均来自真实分享，经人工审核整理。</p></div>
      </div>
    </section>
    <QuestionnaireModal open={open} onClose={() => setOpen(false)} />
  </>;
}
