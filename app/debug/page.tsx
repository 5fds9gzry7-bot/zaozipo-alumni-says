import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { getDebugData } from "@/lib/supabase/queries";

export default async function DebugPage() {
  const data = await getDebugData();
  const rows = [
    ["Supabase URL", data.configured ? "已配置" : "未配置"],
    ["当前用户", data.userEmail || "未登录"],
    ["alumni_profiles 数量", data.alumniCount ?? "无法读取"],
    ["articles 数量", data.articleCount ?? "无法读取"],
  ];
  return <AppShell showNav={false}><PageHeader title="连接调试" subtitle="用于定位 Supabase 配置、登录会话与数据读取问题。" backHref="/me" />
    <section className="rounded-[20px] bg-[#fffdf8] p-5 text-xs shadow-sm">{rows.map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-b border-[#eee5dc] py-3 last:border-0"><span className="text-[#89786e]">{label}</span><strong className="text-right">{value}</strong></div>)}</section>
    <section className="mt-5 rounded-[20px] bg-[#fffdf8] p-5 shadow-sm"><h2 className="font-serif text-base font-bold">profiles 查询结果</h2><pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-[11px] leading-5 text-[#68564c]">{JSON.stringify(data.profile, null, 2)}</pre></section>
    <section className="mt-5 rounded-[20px] bg-[#fffdf8] p-5 shadow-sm"><h2 className="font-serif text-base font-bold">最近错误</h2><div className="mt-3 space-y-2">{data.errors.slice(0, 5).map((error) => <p key={error} className="rounded-[12px] bg-[#f3e5df] p-3 text-[11px] text-[#7b2d26]">{error}</p>)}{data.errors.length === 0 && <p className="text-xs text-[#31594e]">没有检测到错误。</p>}</div></section>
  </AppShell>;
}
