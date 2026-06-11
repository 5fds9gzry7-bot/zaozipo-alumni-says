import Link from "next/link";
import type { Alumni } from "@/lib/mock-data";
import { Pill } from "./Pill";

export function AlumniCard({ person }: { person: Alumni }) {
  return <Link href={`/alumni/${person.id}`} className="group block rounded-[24px] border border-[#e7ddd2] bg-[#fffdf8] p-5 shadow-[0_9px_25px_rgba(76,47,37,0.06)] transition hover:-translate-y-0.5">
    <div className="flex gap-4"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#31594e] font-serif text-xl font-bold text-white shadow-[inset_0_0_0_4px_rgba(255,255,255,0.16)]">{person.name.slice(0, 1)}</div>
      <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h3 className="font-serif text-lg font-bold text-[#3a2821]">{person.name}</h3><p className="mt-0.5 text-[11px] text-[#9a887c]">{person.graduationYear} 届 · {person.city}</p></div><span className="mt-1 text-[#a98b57]">→</span></div><p className="mt-2 text-[13px] font-semibold text-[#554139]">{person.university}</p><p className="mt-0.5 text-xs text-[#88766c]">{person.major} · {person.stage}</p></div></div>
    <p className="mt-4 text-[13px] leading-6 text-[#75665d]">{person.intro}</p><div className="mt-4 flex flex-wrap gap-2">{person.tags.slice(0, 3).map((tag, index) => <Pill key={tag} tone={index === 0 ? "green" : "gold"}>{tag}</Pill>)}</div>
  </Link>;
}
