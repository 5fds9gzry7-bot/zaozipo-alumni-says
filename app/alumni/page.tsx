import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SearchableAlumni } from "@/components/SearchableAlumni";
import { getPublishedAlumni } from "@/lib/supabase/queries";

export default async function AlumniPage() {
  const alumni = await getPublishedAlumni();
  return <AppShell><PageHeader title="枣友名片" subtitle="看见从枣子坡出发的不同大学、专业与人生路径。" /><SearchableAlumni alumni={alumni} /></AppShell>;
}
