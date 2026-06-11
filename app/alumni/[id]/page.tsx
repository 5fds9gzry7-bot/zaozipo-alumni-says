import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { InfoRow } from "@/components/InfoRow";
import { PageHeader } from "@/components/PageHeader";
import { Pill } from "@/components/Pill";
import { ReportForm } from "@/components/forms/ReportForm";
import { getPublishedAlumniById } from "@/lib/supabase/queries";

export default async function AlumniDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getPublishedAlumniById(id);
  if (!person) return <AppShell><PageHeader title="没有找到这张枣友名片" subtitle="这位枣友可能正在更新自己的经历。" backHref="/alumni" /><Link href="/alumni" className="block rounded-[20px] bg-[#31594e] px-5 py-4 text-center text-sm font-semibold text-white">返回枣友名片</Link></AppShell>;
  const advice = [["高中学习方法", person.studyAdvice], ["高考备考经验", person.examAdvice], ["志愿填报建议", person.applicationAdvice], ["大学专业建议", person.majorAdvice]].filter((item) => item[1]);
  return <AppShell><PageHeader title="" backHref="/alumni" />
    <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#31594e,#234239)] p-6 text-white shadow-[0_18px_40px_rgba(42,79,69,0.22)]"><div className="flex items-start gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12 font-serif text-3xl font-bold">{person.name.slice(0, 1)}</div><div className="pt-1"><h1 className="font-serif text-2xl font-bold">{person.name}</h1><p className="mt-1 text-xs text-white/65">{person.graduationYear} 届 · {person.className}</p><p className="mt-3 text-sm font-semibold">{person.university}</p><p className="mt-1 text-xs text-white/70">{person.major} · {person.city}</p></div></div><p className="mt-5 border-t border-white/15 pt-4 font-serif text-[13px] leading-6 text-white/82">{person.intro}</p><div className="mt-4 flex flex-wrap gap-2">{person.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold">{tag}</span>)}</div></section>
    <DetailSection title="当前去向" eyebrow="NOW"><InfoRow label="大学 / 机构" value={person.university} /><InfoRow label="学院" value={person.college} /><InfoRow label="专业" value={person.major} /><InfoRow label="阶段" value={person.stage} /><InfoRow label="方向" value={person.direction} /><InfoRow label="所在地区" value={`${person.city} · ${person.country}`} /></DetailSection>
    <DetailSection title="高考 / 升学参考" eyebrow="REFERENCE"><InfoRow label="高考年份" value={person.gaokaoYear} /><InfoRow label="省份 / 科类" value={`${person.gaokaoProvince} · ${person.gaokaoType}`} />{person.showScore && <InfoRow label="总分" value={person.gaokaoScore} />}{person.showRank && <InfoRow label="位次" value={`约 ${person.gaokaoRank.toLocaleString()}`} />}<InfoRow label="录取大学" value={person.admittedUniversity} /><InfoRow label="录取专业" value={person.admittedMajor} /><p className="mt-4 rounded-[16px] bg-[#f4ede3] p-4 text-[11px] leading-5 text-[#8b786c]">分数、位次和经验仅供参考，不代表当前录取政策。</p></DetailSection>
    <section className="mt-8"><p className="mb-1 text-[10px] font-semibold tracking-[0.18em] text-[#a08255]">EXPERIENCE</p><h2 className="font-serif text-xl font-bold">枣友经验</h2><div className="mt-4 space-y-3">{advice.map(([title, text], index) => <div key={title} className="rounded-[22px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm"><div className="flex items-center gap-3"><span className="font-serif text-xs font-bold text-[#c09a58]">0{index + 1}</span><h3 className="font-serif text-base font-bold">{title}</h3></div><p className="mt-3 text-[13px] leading-7 text-[#78675e]">{text}</p></div>)}</div></section>
    {person.messageToStudents && <section className="mt-6 rounded-[24px] bg-[#7b2d26] p-6 text-white"><Pill tone="gold">给学弟学妹的一句话</Pill><p className="mt-4 font-serif text-base leading-8 text-white/90">“{person.messageToStudents}”</p></section>}
    <DetailSection title="公开联系方式" eyebrow="CONTACT">{person.showContact ? <p className="text-sm font-semibold text-[#4e3932]">{person.contact}</p> : <p className="text-sm text-[#84736a]">该枣友暂未公开联系方式。</p>}<p className="mt-3 text-[11px] leading-5 text-[#a08e83]">联系方式由本人自愿公开，请礼貌交流，注意保护个人隐私。</p></DetailSection><ReportForm targetId={person.id} targetType="alumni_profile" />
  </AppShell>;
}

function DetailSection({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) { return <section className="mt-6 rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.18em] text-[#a08255]">{eyebrow}</p><h2 className="mt-1 mb-3 font-serif text-lg font-bold">{title}</h2>{children}</section>; }
