"use client";

import { useMemo, useState } from "react";
import type { Alumni } from "@/lib/mock-data";
import { AlumniCard } from "./AlumniCard";
import { inputClass } from "./forms/FormControls";

export function SearchableAlumni({ alumni }: { alumni: Alumni[] }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("全部");
  const tags = ["全部", ...new Set(alumni.flatMap((item) => item.tags))].slice(0, 8);
  const visible = useMemo(() => alumni.filter((item) => (tag === "全部" || item.tags.includes(tag)) && `${item.name}${item.university}${item.major}${item.graduationYear}${item.city}`.includes(query.trim())), [alumni, tag, query]);
  return <>
    <input value={query} onChange={(event) => setQuery(event.target.value)} className={inputClass} placeholder="搜索大学、专业、毕业年份、城市" />
    <div className="-mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none]">{tags.map((item) => <button key={item} onClick={() => setTag(item)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold ${tag === item ? "bg-[#7b2d26] text-white" : "border border-[#e4d8cc] bg-[#fffdf8] text-[#76655b]"}`}>{item}</button>)}</div>
    <div className="mt-5 space-y-4">{visible.map((person) => <AlumniCard key={person.id} person={person} />)}{visible.length === 0 && <div className="rounded-[22px] border border-dashed border-[#d8c8b8] p-8 text-center text-sm text-[#8a786d]">暂时没有找到相关枣友。</div>}</div>
  </>;
}
