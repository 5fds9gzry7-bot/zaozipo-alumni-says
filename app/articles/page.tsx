import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { SearchableArticles } from "@/components/SearchableArticles";
import { getPublishedArticles } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ArticlesPage() {
  const articles = await getPublishedArticles();
  return <AppShell><PageHeader title="枣子经验" subtitle="来自学长学姐的学习、升学与成长经验。" /><SearchableArticles articles={articles} /></AppShell>;
}
