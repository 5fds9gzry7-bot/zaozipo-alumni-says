import Link from "next/link";
import { BrandMark } from "./BrandMark";

export function PageHeader({ title, subtitle, backHref }: { title: string; subtitle?: string; backHref?: string }) {
  return (
    <header className="mb-7">
      <div className="flex items-center justify-between">
        {backHref ? <Link href={backHref} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7dbcf] bg-[#fffdf8] text-lg text-[#6f5e54] shadow-sm" aria-label="返回">←</Link> : <BrandMark />}
        <span className="text-[10px] font-semibold tracking-[0.2em] text-[#a08255]">ZAOZIPO ALUMNI</span>
      </div>
      {title && <h1 className="mt-6 font-serif text-[30px] font-bold leading-tight text-[#3a2720]">{title}</h1>}
      {subtitle && <p className="mt-3 max-w-sm text-sm leading-6 text-[#817168]">{subtitle}</p>}
    </header>
  );
}
