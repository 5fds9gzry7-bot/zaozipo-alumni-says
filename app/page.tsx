import Link from "next/link";
import { AlumniCard } from "@/components/AlumniCard";
import { AppShell } from "@/components/AppShell";
import { ArticleCard } from "@/components/ArticleCard";
import { BrandMark } from "@/components/BrandMark";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { getPublishedAlumni, getPublishedArticles } from "@/lib/supabase/queries";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const shortcuts = [{ label: "高考经验", icon: "卷", href: "/articles" }, { label: "志愿填报", icon: "向", href: "/articles" }, { label: "大学专业", icon: "学", href: "/articles" }, { label: "留学申请", icon: "远", href: "/alumni" }];

export default async function HomePage() {
  const [articles, alumni] = await Promise.all([getPublishedArticles(), getPublishedAlumni()]);
  const stats = [{ value: String(articles.length), label: "经验文章" }, { value: String(alumni.length), label: "枣友名片" }, { value: String(new Set(alumni.map((item) => item.university)).size), label: "覆盖大学" }];
  return <AppShell>
    {!isSupabaseConfigured() && <p className="mb-4 rounded-[16px] bg-[#f2eadc] px-4 py-3 text-[11px] leading-5 text-[#806c5e]">当前为体验数据模式。配置 Supabase 后将自动读取真实内容。</p>}
    <section className="hero-hills relative overflow-hidden rounded-[30px] bg-[linear-gradient(145deg,#6d2723_0%,#85342c_58%,#5f3029_100%)] px-6 pb-7 pt-6 text-white shadow-[0_20px_45px_rgba(91,39,34,0.24)]"><div className="relative z-10"><div className="flex items-start justify-between gap-5"><div><p className="max-w-[220px] text-[10px] font-semibold leading-5 tracking-[0.16em] text-[#ead1bd]">溆浦一中非官方校友经验分享平台</p><h1 className="mt-4 font-serif text-[31px] font-bold leading-tight">枣子坡校友说</h1></div><BrandMark size="lg" inverted /></div><p className="mt-5 max-w-[290px] text-sm leading-6 text-white/86">听学长学姐讲大学、专业、高考和成长经验。</p><div className="mt-6 flex items-center gap-3 border-t border-white/15 pt-4"><span className="h-px w-7 bg-[#d8b06b]" /><p className="font-serif text-xs text-[#f2dfc9]">从枣子坡出发，看见更远的大学与世界。</p></div></div></section>
    <section className="mt-5 grid grid-cols-3 gap-3">{stats.map((stat) => <StatCard key={stat.label} {...stat} />)}</section>
    <section className="mt-8"><SectionHeader title="从哪里开始" eyebrow="EXPLORE" /><div className="grid grid-cols-2 gap-3">{shortcuts.map((item) => <Link key={item.label} href={item.href} className="flex items-center gap-3 rounded-[20px] border border-[#e8ddd1] bg-[#fffdf8] p-3.5 shadow-sm"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf1eb] font-serif text-sm font-bold text-[#31594e]">{item.icon}</span><span className="text-[13px] font-semibold text-[#59473f]">{item.label}</span></Link>)}</div></section>
    <section className="mt-9"><SectionHeader title="枣子经验" eyebrow="FIELD NOTES" href="/articles" /><div className="space-y-4">{articles.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} />)}{articles.length === 0 && <Empty text="还没有公开的经验文章。" />}</div></section>
    <section className="mt-9"><SectionHeader title="热门枣友" eyebrow="ALUMNI" href="/alumni" linkLabel="更多枣友" /><div className="space-y-4">{alumni.slice(0, 3).map((person) => <AlumniCard key={person.id} person={person} />)}{alumni.length === 0 && <Empty text="还没有公开的枣友名片。" />}</div></section>
  </AppShell>;
}

function Empty({ text }: { text: string }) { return <p className="rounded-[20px] border border-dashed border-[#d8c8b8] p-6 text-center text-xs text-[#8a786d]">{text}</p>; }
