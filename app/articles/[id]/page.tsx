import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Pill } from "@/components/Pill";
import { ArticleActions } from "@/components/forms/ArticleActions";
import { getArticleViewerState, getPublishedArticleById } from "@/lib/supabase/queries";

export default async function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [article, viewer] = await Promise.all([getPublishedArticleById(id), getArticleViewerState(id)]);
  if (!article) return <AppShell><PageHeader title="没有找到这篇经验" subtitle="它可能正在整理，或者暂时离开了枣篮。" backHref="/articles" /><Link href="/articles" className="block rounded-[20px] bg-[#7b2d26] px-5 py-4 text-center text-sm font-semibold text-white">返回枣子经验</Link></AppShell>;
  return <AppShell><PageHeader title="" backHref="/articles" /><article><Pill>{article.category}</Pill><h1 className="mt-5 font-serif text-[28px] font-bold leading-[1.45] text-[#39261f]">{article.title}</h1><p className="mt-4 font-serif text-sm leading-7 text-[#806c60]">{article.excerpt}</p><div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 border-y border-[#e8ddd1] py-4 text-[11px] text-[#958278]"><span>{article.authorName} · {article.graduationYear} 届</span><span>{article.readTime}</span><span>枣 {article.likeCount}</span><span>收藏 {article.favoriteCount}</span></div><div className="mt-7 space-y-6">{article.paragraphs.map((paragraph) => <p key={paragraph} className="font-serif text-[15px] leading-8 text-[#59463d]">{paragraph}</p>)}</div><div className="mt-9 rounded-[22px] border-l-4 border-[#c9a45c] bg-[#f2eadc] p-5 text-xs leading-6 text-[#786558]">本文为校友个人经验分享，仅供参考。升学政策、录取分数和专业情况会随年份变化，请以官方信息为准。</div><ArticleActions articleId={article.id} {...viewer} /></article></AppShell>;
}
