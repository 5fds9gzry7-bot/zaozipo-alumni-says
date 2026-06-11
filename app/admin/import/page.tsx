import { ImportTool } from "@/components/admin/ImportTool";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

export default function AdminImportPage() {
  return <AppShell showNav={false}><PageHeader title="导入问卷星数据" subtitle="上传 Excel，预览重复项并批量创建枣友与文章。" backHref="/admin" /><ImportTool /></AppShell>;
}
