import { alumni as mockAlumni, articles as mockArticles, type Alumni, type Article } from "@/lib/mock-data";
import { isSupabaseConfigured } from "./config";
import { createSupabaseServerClient } from "./server";
import type { AdminAction, AdminDashboardData, AlumniProfile, ArticleRecord, DebugData, Profile, Report } from "./types";

type ArticleQueryRow = ArticleRecord & {
  profiles: { display_name: string | null } | null;
  alumni_profiles: { display_name: string; graduation_year: number } | null;
};

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackArticles(limit);
  let query = supabase.from("articles").select("*, profiles!articles_author_id_fkey(display_name), alumni_profiles(display_name, graduation_year)").eq("status", "published").order("published_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return fallbackArticles(limit);
  return (data as unknown as ArticleQueryRow[]).map(toArticle);
}

export async function getPublishedArticleById(id: string): Promise<Article | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockArticles.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase.from("articles").select("*, profiles!articles_author_id_fkey(display_name), alumni_profiles(display_name, graduation_year)").eq("id", id).eq("status", "published").maybeSingle();
  if (error) return mockArticles.find((item) => item.id === id) ?? null;
  return data ? toArticle(data as unknown as ArticleQueryRow) : null;
}

export async function getPublishedAlumni(limit?: number): Promise<Alumni[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return fallbackAlumni(limit);
  let query = supabase.from("alumni_profiles").select("*").eq("status", "published").order("graduation_year", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return fallbackAlumni(limit);
  return (data as unknown as AlumniProfile[]).map(toAlumni);
}

export async function getPublishedAlumniById(id: string): Promise<Alumni | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return mockAlumni.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase.from("alumni_profiles").select("*").eq("id", id).eq("status", "published").maybeSingle();
  if (error) return mockAlumni.find((item) => item.id === id) ?? null;
  return data ? toAlumni(data as unknown as AlumniProfile) : null;
}

export async function getMyProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
  return data as unknown as Profile | null;
}

export async function getMyAlumniProfile(): Promise<AlumniProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data } = await supabase.from("alumni_profiles").select("*").eq("user_id", auth.user.id).maybeSingle();
  return data as unknown as AlumniProfile | null;
}

export async function getMyArticles(): Promise<ArticleRecord[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data } = await supabase.from("articles").select("*").eq("author_id", auth.user.id).order("created_at", { ascending: false });
  return (data ?? []) as unknown as ArticleRecord[];
}

export async function getMyFavorites(): Promise<Article[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return [];
  const { data } = await supabase.from("article_favorites").select("articles(*, profiles!articles_author_id_fkey(display_name), alumni_profiles(display_name, graduation_year))").eq("user_id", auth.user.id);
  return ((data ?? []) as unknown as { articles: ArticleQueryRow | null }[]).flatMap((row) => row.articles ? [toArticle(row.articles)] : []);
}

export async function getArticleViewerState(articleId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { loggedIn: false, liked: false, favorited: false };
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { loggedIn: false, liked: false, favorited: false };
  const [{ data: like }, { data: favorite }] = await Promise.all([
    supabase.from("article_likes").select("id").eq("article_id", articleId).eq("user_id", auth.user.id).maybeSingle(),
    supabase.from("article_favorites").select("id").eq("article_id", articleId).eq("user_id", auth.user.id).maybeSingle(),
  ]);
  return { loggedIn: true, liked: Boolean(like), favorited: Boolean(favorite) };
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const profile = await getMyProfile();
  const empty = { profile, reports: [], alumni: [], articles: [], users: [], recentActions: [] };
  if (!profile || !["admin", "super_admin"].includes(profile.role)) return empty;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return empty;
  const [reports, alumni, articles, users, actions] = await Promise.all([
    supabase.from("reports").select("*").eq("status", "pending").order("created_at"),
    supabase.from("alumni_profiles").select("*").order("updated_at", { ascending: false }).limit(10),
    supabase.from("articles").select("*").order("updated_at", { ascending: false }).limit(10),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("admin_actions").select("*").order("created_at", { ascending: false }).limit(10),
  ]);
  return {
    profile, reports: (reports.data ?? []) as unknown as Report[], alumni: (alumni.data ?? []) as unknown as AlumniProfile[],
    articles: (articles.data ?? []) as unknown as ArticleRecord[], users: (users.data ?? []) as unknown as Profile[],
    recentActions: (actions.data ?? []) as unknown as AdminAction[],
  };
}

export async function getDebugData(): Promise<DebugData> {
  const result: DebugData = { configured: isSupabaseConfigured(), userEmail: null, profile: null, alumniCount: null, articleCount: null, errors: [] };
  const supabase = await createSupabaseServerClient();
  if (!supabase) { result.errors.push("Supabase 环境变量未配置。"); return result; }
  const auth = await supabase.auth.getUser();
  if (auth.error && !auth.error.message.includes("Auth session missing")) result.errors.push(`auth: ${auth.error.message}`);
  result.userEmail = auth.data.user?.email ?? null;
  if (auth.data.user) {
    const profile = await supabase.from("profiles").select("*").eq("id", auth.data.user.id).maybeSingle();
    if (profile.error) result.errors.push(`profiles: ${formatQueryError(profile.error)}`);
    result.profile = profile.data as unknown as Profile | null;
  }
  const [alumni, articles] = await Promise.all([
    supabase.from("alumni_profiles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }),
  ]);
  if (alumni.error) result.errors.push(`alumni_profiles: ${formatQueryError(alumni.error)}`);
  if (articles.error) result.errors.push(`articles: ${formatQueryError(articles.error)}`);
  result.alumniCount = alumni.count; result.articleCount = articles.count;
  return result;
}

function fallbackArticles(limit?: number) { return limit ? mockArticles.slice(0, limit) : mockArticles; }
function fallbackAlumni(limit?: number) { return limit ? mockAlumni.slice(0, limit) : mockAlumni; }
function formatQueryError(error: { message: string; code?: string; details?: string; hint?: string }) { return [error.message || "查询失败，请执行 supabase/no-review-reset.sql 重置旧 schema/RLS", error.code, error.details, error.hint].filter(Boolean).join(" · "); }
function toArticle(row: ArticleQueryRow): Article { return { id: row.id, title: row.title, excerpt: row.excerpt, category: row.category, authorName: row.alumni_profiles?.display_name || row.profiles?.display_name || "枣友", graduationYear: row.alumni_profiles?.graduation_year ?? new Date(row.created_at).getFullYear(), readTime: row.read_time, likeCount: row.like_count, favoriteCount: row.favorite_count, paragraphs: row.content.split(/\n\s*\n/).filter(Boolean) }; }
function toAlumni(row: AlumniProfile): Alumni { return { id: row.id, name: row.display_name, graduationYear: row.graduation_year, className: row.class_name ?? "", university: row.university, college: row.college ?? "", major: row.major, city: row.city, country: row.country, stage: row.stage, direction: row.direction ?? "", tags: row.tags ?? [], intro: row.intro, gaokaoYear: row.gaokao_year ?? row.graduation_year, gaokaoProvince: row.gaokao_province ?? "", gaokaoType: row.gaokao_type ?? "", gaokaoScore: row.gaokao_score ?? 0, gaokaoRank: row.gaokao_rank ?? 0, showScore: row.show_score, showRank: row.show_rank, admittedUniversity: row.admitted_university ?? row.university, admittedMajor: row.admitted_major ?? row.major, studyAdvice: row.study_advice ?? "", examAdvice: row.exam_advice ?? "", applicationAdvice: row.application_advice ?? "", majorAdvice: row.major_advice ?? "", messageToStudents: row.message_to_students ?? "", contact: row.contact ?? "", showContact: row.show_contact }; }
