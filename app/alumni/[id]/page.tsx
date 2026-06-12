import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ArticleCard } from "@/components/ArticleCard";
import { InfoRow } from "@/components/InfoRow";
import { PageHeader } from "@/components/PageHeader";
import { getPublishedAlumniById, getPublishedArticlesByAlumni } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AlumniDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [person, articles] = await Promise.all([getPublishedAlumniById(id), getPublishedArticlesByAlumni(id)]);
  if (!person) return <AppShell><PageHeader title="没有找到这张枣友名片" subtitle="这位枣友的资料可能暂未公开。" backHref="/alumni" /><Link href="/alumni" className="block rounded-[20px] bg-[#31594e] px-5 py-4 text-center text-sm font-semibold text-white">返回枣友名片</Link></AppShell>;
  const className = formatClassName(person.className);

  return <AppShell><PageHeader title="" backHref="/alumni" />
    <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#31594e,#234239)] p-6 text-white shadow-[0_18px_40px_rgba(42,79,69,0.22)]">
      <div className="flex items-start gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/12 font-serif text-3xl font-bold">{person.name.slice(0, 1)}</div><div className="pt-1"><h1 className="font-serif text-2xl font-bold">{person.name}</h1><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">{person.graduationYear}届</span><span className="rounded-full bg-[#d9b56e]/25 px-3 py-1.5 text-sm font-bold text-[#ffe8b9]">{className}</span></div><p className="mt-3 text-sm font-semibold">{person.university}</p><p className="mt-1 text-xs text-white/70">{person.major} · {person.city}</p></div></div>
      <p className="mt-5 border-t border-white/15 pt-4 font-serif text-[13px] leading-6 text-white/82">{person.intro}</p>
      <div className="mt-4 flex flex-wrap gap-2">{person.tags.map((tag) => <span key={tag} className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold">{tag}</span>)}</div>
    </section>
    <DetailSection title="当前去向" eyebrow="NOW"><InfoRow label="大学 / 机构" value={person.university} /><InfoRow label="学院" value={person.college} /><InfoRow label="专业" value={person.major} /><InfoRow label="阶段" value={person.stage} /><InfoRow label="研究 / 职业方向" value={person.direction} /><InfoRow label="所在地区" value={[person.city, person.country].filter(Boolean).join(" · ")} /></DetailSection>
    {person.messageToStudents && <DetailSection title="个人简介" eyebrow="PROFILE"><p className="font-serif text-sm leading-8 text-[#59463d]">{person.messageToStudents}</p></DetailSection>}
    {person.showContact && person.contact && <DetailSection title="公开联系方式" eyebrow="CONTACT"><InfoRow label="联系枣友" value={person.contact} /></DetailSection>}
    {articles.length > 0 && <DetailSection title={`${person.name} 的经验文章`} eyebrow="FIELD NOTES"><div className="space-y-4">{articles.map((article) => <ArticleCard key={article.id} article={article} />)}</div></DetailSection>}
    <section className="mt-6 rounded-[22px] border-l-4 border-[#c9a45c] bg-[#f2eadc] p-5 text-xs leading-6 text-[#786558]">本页内容来自校友问卷分享，经整理后公开展示。</section>
  </AppShell>;
}

function DetailSection({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <section className="mt-6 rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm"><p className="text-[10px] font-semibold tracking-[0.18em] text-[#a08255]">{eyebrow}</p><h2 className="mt-1 mb-3 font-serif text-lg font-bold">{title}</h2>{children}</section>;
}

function formatClassName(className: string) {
  const trimmed = className.trim();
  if (!trimmed) return "溆浦一中校友";
  return trimmed.endsWith("班") ? trimmed : `${trimmed}班`;
}
