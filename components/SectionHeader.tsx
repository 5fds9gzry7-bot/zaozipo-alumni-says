import Link from "next/link";

export function SectionHeader({ title, eyebrow, href, linkLabel = "查看全部" }: { title: string; eyebrow?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-[11px] font-semibold tracking-[0.18em] text-[#9c7a48]">{eyebrow}</p>}
        <h2 className="font-serif text-xl font-bold text-[#3d2922]">{title}</h2>
      </div>
      {href && <Link href={href} className="shrink-0 text-xs font-semibold text-[#7b2d26]">{linkLabel} →</Link>}
    </div>
  );
}
