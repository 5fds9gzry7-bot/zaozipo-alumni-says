import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Pill } from "@/components/Pill";
import { getPublishedArticleById } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = await getPublishedArticleById(id);
  if (!article) return { title: "经验文章未找到" };
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { title: article.title, description: article.excerpt, type: "article" },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const article = await getPublishedArticleById(id);
  if (!article) return <AppShell><PageHeader title="没有找到这篇经验" subtitle="它可能正在整理，或暂时未公开。" backHref="/articles" /><Link href="/articles" className="block rounded-[20px] bg-[#7b2d26] px-5 py-4 text-center text-sm font-semibold text-white">返回经验文章</Link></AppShell>;
  return <AppShell><PageHeader title="" backHref="/articles" /><article><Pill>{article.category}</Pill><h1 className="mt-5 font-serif text-[28px] font-bold leading-[1.45] text-[#39261f]">{article.title}</h1><p className="mt-4 font-serif text-sm leading-7 text-[#806c60]">{article.excerpt}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-[#e8ddd1] py-4 text-[11px] text-[#958278]"><span>{article.authorName} · {article.graduationYear} 届</span><span>{article.submittedAt || article.readTime}</span></div>{article.authorId && <Link href={`/alumni/${article.authorId}`} className="mt-5 flex items-center justify-between rounded-[18px] bg-[#31594e] px-5 py-4 text-sm font-semibold text-white shadow-sm"><span>查看 {article.authorName} 的枣友名片</span><span>→</span></Link>}<div className="mt-7 space-y-6">{article.paragraphs.map((paragraph) => <p key={paragraph} className="whitespace-pre-line font-serif text-[15px] leading-8 text-[#59463d]">{paragraph}</p>)}</div><div className="mt-9 rounded-[22px] border-l-4 border-[#c9a45c] bg-[#f2eadc] p-5 text-xs leading-6 text-[#786558]">本文为校友个人经验分享，仅供参考。升学政策、录取分数和专业情况会随年份变化，请以官方信息为准。</div></article></AppShell>;
}
