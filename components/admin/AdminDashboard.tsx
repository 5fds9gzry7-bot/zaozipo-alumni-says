"use client";

import Link from "next/link";
import { useState } from "react";

type DashboardData = {
  stats: { alumni: number; articles: number; universities: number; lastUpdated: string | null };
  system: { supabase: string; edgeOneVersion: string; environment: string };
  imports: { id: string; filename: string; total_profiles: number; total_articles: number; skipped_duplicates: number; skipped_invalid: number; imported_at: string; operator: string }[];
  alumni: { id: string; name: string; university: string; major: string; published: boolean }[];
  articles: { id: string; title: string; category: string; published: boolean }[];
};

export function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<"等待检查" | "正常" | "异常">("等待检查");

  async function request(body: Record<string, unknown>) {
    const response = await fetch("/api/admin/dashboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ secret, ...body }) });
    const payload = await response.json() as DashboardData & { error?: string };
    if (!response.ok) throw new Error(payload.error || "后台操作失败。");
    setData(payload);
  }

  async function run(body: Record<string, unknown>) {
    setPending(true);
    setMessage(null);
    try { await request(body); setSupabaseStatus("正常"); } catch (error) { setSupabaseStatus("异常"); setMessage(error instanceof Error ? error.message : "后台操作失败。"); } finally { setPending(false); }
  }

  return <div className="space-y-7">
    <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-sm"><p className="text-xs leading-6 text-[#806f65]">请输入部署环境中的 `ADMIN_IMPORT_SECRET`。</p><div className="mt-4 flex gap-3"><input value={secret} onChange={(event) => setSecret(event.target.value)} type="password" placeholder="管理员密钥" className="min-w-0 flex-1 rounded-[16px] border border-[#e8ddd2] bg-[#f8f3eb] px-4 py-3 text-sm outline-none" /><button type="button" disabled={pending || !secret} onClick={() => void run({ action: "load" })} className="rounded-[16px] bg-[#31594e] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">进入</button></div>{message && <p className="mt-3 text-xs text-[#7b2d26]">{message}</p>}</section>
    {!data && <section><Heading title="系统状态" /><div className="grid grid-cols-3 gap-3"><Metric label="Supabase" value={supabaseStatus} /><Metric label="EdgeOne 版本" value="v1.1" /><Metric label="当前环境" value="Production" /></div></section>}
    {data && <><section><Heading title="内容统计" /><div className="grid grid-cols-2 gap-3"><Metric label="总枣友数" value={data.stats.alumni} /><Metric label="总文章数" value={data.stats.articles} /><Metric label="覆盖大学数" value={data.stats.universities} /><Metric label="最近更新时间" value={data.stats.lastUpdated ? new Date(data.stats.lastUpdated).toLocaleDateString("zh-CN") : "暂无"} /></div></section>
      <section><Heading title="系统状态" /><div className="grid grid-cols-3 gap-3"><Metric label="Supabase" value={data.system.supabase} /><Metric label="EdgeOne 版本" value={data.system.edgeOneVersion} /><Metric label="当前环境" value={data.system.environment} /></div></section>
      <Link href="/admin/import" className="block rounded-[18px] bg-[#7b2d26] px-5 py-4 text-center text-sm font-semibold text-white">导入问卷星 Excel</Link>
      <section><Heading title="导入记录" /><div className="space-y-3">{data.imports.map((item) => <article key={item.id} className="rounded-[20px] bg-[#fffdf8] p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{item.filename}</p><p className="mt-1 text-[11px] text-[#8c7b71]">{new Date(item.imported_at).toLocaleString("zh-CN")} · {item.operator}</p></div><button disabled={pending} onClick={() => { if (window.confirm("确定删除这条导入记录吗？")) void run({ action: "delete-import", id: item.id }); }} className="rounded-[10px] bg-[#f3e5df] px-3 py-2 text-[10px] font-semibold text-[#7b2d26]">删除记录</button></div><div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#806f65]"><span>导入人数：{item.total_profiles}</span><span>导入文章：{item.total_articles}</span><span>跳过重复：{item.skipped_duplicates}</span><span>跳过缺失：{item.skipped_invalid}</span></div></article>)}</div></section>
      <List title="近期文章">{data.articles.map((item) => <ManageCard key={item.id} title={item.title} detail={item.category} published={item.published} pending={pending} onAction={(contentAction) => void run({ action: "manage", table: "articles", id: item.id, contentAction })} />)}</List>
      <List title="近期枣友">{data.alumni.map((item) => <ManageCard key={item.id} title={item.name} detail={`${item.university} · ${item.major}`} published={item.published} pending={pending} onAction={(contentAction) => void run({ action: "manage", table: "alumni_profiles", id: item.id, contentAction })} />)}</List>
    </>}
  </div>;
}

function Heading({ title }: { title: string }) { return <h2 className="mb-3 font-serif text-lg font-bold">{title}</h2>; }
function Metric({ label, value }: { label: string; value: number | string }) { return <div className="rounded-[20px] border border-[#e7dbcf] bg-[#fffdf8] p-4 text-center shadow-sm"><p className="break-words font-serif text-lg font-bold">{value}</p><p className="mt-1 text-[10px] text-[#938278]">{label}</p></div>; }
function List({ title, children }: { title: string; children: React.ReactNode }) { return <section><Heading title={title} /><div className="space-y-3">{children}</div></section>; }
function ManageCard({ title, detail, published, pending, onAction }: { title: string; detail: string; published: boolean; pending: boolean; onAction: (action: "hide" | "publish" | "delete") => void }) { return <div className="rounded-[18px] bg-[#fffdf8] p-4 shadow-sm"><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-[#8c7b71]">{detail}</p><div className="mt-3 flex gap-2"><button disabled={pending} onClick={() => onAction(published ? "hide" : "publish")} className="flex-1 rounded-[12px] bg-[#31594e] px-3 py-2 text-xs font-semibold text-white">{published ? "隐藏" : "恢复公开"}</button><button disabled={pending} onClick={() => { if (window.confirm("确定永久删除这条内容吗？")) onAction("delete"); }} className="rounded-[12px] bg-[#7b2d26] px-3 py-2 text-xs font-semibold text-white">删除</button></div></div>; }
