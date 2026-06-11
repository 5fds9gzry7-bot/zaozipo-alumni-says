import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AdminReviewCard } from "@/components/admin/AdminReviewCard";
import { getAdminDashboardData } from "@/lib/supabase/queries";

export default async function AdminPage() {
  const data = await getAdminDashboardData();
  if (!data.profile || !["admin", "super_admin"].includes(data.profile.role)) return <AppShell showNav={false}><PageHeader title="枣园管理" subtitle="只有管理员可以进入此区域。" backHref="/me" /><div className="rounded-[22px] bg-[#fffdf8] p-6 text-center text-sm text-[#7b2d26] shadow-sm">你当前没有管理员权限。</div></AppShell>;
  const metrics = [{ value: data.reports.length, label: "待处理举报", tone: "bg-[#9b783e]" }, { value: data.articles.length, label: "近期文章", tone: "bg-[#31594e]" }, { value: data.users.length, label: "近期用户", tone: "bg-[#7b2d26]" }];
  return <AppShell showNav={false}><PageHeader title="枣园管理" subtitle="管理公开内容、用户状态和举报，不再承担发布审核。" backHref="/me" />
    <section className="grid grid-cols-3 gap-3">{metrics.map((item) => <div key={item.label} className="overflow-hidden rounded-[20px] border border-[#e7dbcf] bg-[#fffdf8] shadow-sm"><div className={`h-1 ${item.tone}`} /><div className="px-2 py-4 text-center"><p className="font-serif text-2xl font-bold">{item.value}</p><p className="mt-1 text-[10px] text-[#938278]">{item.label}</p></div></div>)}</section>
    <Queue title="待处理举报">{data.reports.map((item) => <AdminReviewCard key={item.id} kind="report" id={item.id} title={item.reason} detail={item.detail || `${item.target_type} · ${item.target_id}`} status={item.status} />)}</Queue>
    <Queue title="近期文章">{data.articles.map((item) => <AdminReviewCard key={item.id} kind="article" id={item.id} title={item.title} detail={item.excerpt} status={item.status} />)}</Queue>
    <Queue title="近期枣友名片">{data.alumni.map((item) => <AdminReviewCard key={item.id} kind="alumni" id={item.id} title={item.display_name} detail={`${item.university} · ${item.major}`} status={item.status} />)}</Queue>
    <Queue title="近期用户">{data.users.map((item) => <AdminReviewCard key={item.id} kind="user" id={item.id} title={item.display_name || item.email || "用户"} detail={`${item.email || ""} · ${item.role}`} status={item.status} />)}</Queue>
    <Queue title="最近管理员操作">{data.recentActions.map((item) => <div key={item.id} className="rounded-[18px] bg-[#fffdf8] p-4 text-xs shadow-sm"><p className="font-semibold">{item.action_type}</p><p className="mt-1 text-[#8e7d72]">{item.note || item.target_type}</p></div>)}</Queue>
  </AppShell>;
}
function Queue({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-8"><h2 className="mb-4 font-serif text-lg font-bold">{title}</h2><div className="space-y-3">{children}</div></section>; }
