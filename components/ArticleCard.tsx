import Link from "next/link";
import type { Article } from "@/lib/mock-data";
import { Pill } from "./Pill";

export function ArticleCard({ article }: { article: Article }) {
  return <Link href={`/articles/${article.id}`} className="group block rounded-[24px] border border-[#eadfd3] bg-[#fffdf8] p-5 shadow-[0_9px_25px_rgba(76,47,37,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(76,47,37,0.10)]">
    <div className="flex items-center justify-between gap-3"><Pill>{article.category}</Pill><span className="text-[11px] text-[#a09288]">{article.readTime}</span></div>
    <h3 className="mt-4 font-serif text-[17px] font-bold leading-7 text-[#3a2821] group-hover:text-[#7b2d26]">{article.title}</h3>
    <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-[#796b62]">{article.excerpt}</p>
    <div className="mt-4 flex items-center justify-between border-t border-[#eee5dc] pt-3 text-[11px] text-[#9a8a80]"><span>{article.authorName} · {article.graduationYear} 届</span><span>阅读全文 →</span></div>
  </Link>;
}
