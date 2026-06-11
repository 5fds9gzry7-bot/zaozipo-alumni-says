"use client";

import { useMemo, useState } from "react";
import type { Article } from "@/lib/mock-data";
import { ArticleCard } from "./ArticleCard";
import { inputClass } from "./forms/FormControls";

export function SearchableArticles({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("全部");
  const categories = ["全部", ...new Set(articles.map((item) => item.category))];
  const visible = useMemo(() => articles.filter((item) => (category === "全部" || item.category === category) && `${item.title}${item.category}${item.excerpt}`.includes(query.trim())), [articles, category, query]);
  return <>
    <input value={query} onChange={(event) => setQuery(event.target.value)} className={inputClass} placeholder="搜索标题、分类或关键词" />
    <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${category === item ? "bg-[#31594e] text-white" : "border border-[#e4d8cc] bg-[#fffdf8] text-[#76655b]"}`}>{item}</button>)}</div>
    <div className="mt-6 space-y-4">{visible.map((article) => <ArticleCard key={article.id} article={article} />)}{visible.length === 0 && <Empty />}</div>
  </>;
}

function Empty() { return <div className="rounded-[22px] border border-dashed border-[#d8c8b8] p-8 text-center text-sm text-[#8a786d]">暂时没有找到相关枣子经验。</div>; }
