import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

export default function AdminPage() {
  return <AppShell showNav={false}><PageHeader title="枣园管理" subtitle="查看导入记录，管理公开内容。" backHref="/" /><AdminDashboard /></AppShell>;
}
