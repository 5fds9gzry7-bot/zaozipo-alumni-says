import { createClient } from "@supabase/supabase-js";
import { curatedAlumni, curatedArticles } from "@/lib/curated-data";
import { alumni as mockAlumni, articles as mockArticles, type Alumni, type Article } from "@/lib/mock-data";
import { getSupabaseConfig } from "./config";

type AlumniRow = {
  id: string;
  name: string;
  graduation_year: number;
  class_name: string | null;
  university: string;
  school: string | null;
  major: string;
  city: string;
  country: string;
  education_level: string;
  research_direction: string | null;
  tags: string[] | null;
  short_intro: string;
  bio: string | null;
  contact: string | null;
  show_contact: boolean | null;
};

type ArticleRow = {
  id: string;
  alumni_id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  created_at: string;
  alumni_profiles: { id: string; name: string; graduation_year: number } | null;
};

function getPublicClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function getPublishedArticles(limit?: number): Promise<Article[]> {
  const supabase = getPublicClient();
  if (!supabase) return combinedArticles(mockArticles, limit);
  let query = supabase.from("articles").select("*, alumni_profiles(id, name, graduation_year)").eq("published", true).order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return combinedArticles(mockArticles, limit);
  return combinedArticles((data as unknown as ArticleRow[]).map(toArticle), limit);
}

export async function getPublishedArticleById(id: string): Promise<Article | null> {
  const curated = curatedArticles.find((item) => item.id === id);
  if (curated) return curated;
  const supabase = getPublicClient();
  if (!supabase) return mockArticles.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase.from("articles").select("*, alumni_profiles(id, name, graduation_year)").eq("id", id).eq("published", true).maybeSingle();
  if (error) return mockArticles.find((item) => item.id === id) ?? null;
  return data ? toArticle(data as unknown as ArticleRow) : null;
}

export async function getPublishedAlumni(limit?: number): Promise<Alumni[]> {
  const supabase = getPublicClient();
  if (!supabase) return combinedAlumni(mockAlumni, limit);
  let query = supabase.from("alumni_profiles").select("*").eq("published", true).order("graduation_year", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return combinedAlumni(mockAlumni, limit);
  return combinedAlumni((data as unknown as AlumniRow[]).map(toAlumni), limit);
}

export async function getPublishedAlumniById(id: string): Promise<Alumni | null> {
  const curated = curatedAlumni.find((item) => item.id === id);
  if (curated) return curated;
  const supabase = getPublicClient();
  if (!supabase) return mockAlumni.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase.from("alumni_profiles").select("*").eq("id", id).eq("published", true).maybeSingle();
  if (error) return mockAlumni.find((item) => item.id === id) ?? null;
  return data ? toAlumni(data as unknown as AlumniRow) : null;
}

export async function getPublishedArticlesByAlumni(id: string): Promise<Article[]> {
  const [person, articles] = await Promise.all([getPublishedAlumniById(id), getPublishedArticles()]);
  if (!person) return [];
  return articles.filter((article) => article.authorId === id || (!article.authorId && article.authorName === person.name && article.graduationYear === person.graduationYear));
}

function combinedArticles(source: Article[], limit?: number) {
  const result = [...curatedArticles, ...source.filter((article) => !curatedArticles.some((curated) => curated.title === article.title && curated.authorName === article.authorName))];
  return limit ? result.slice(0, limit) : result;
}

function combinedAlumni(source: Alumni[], limit?: number) {
  const result = [...curatedAlumni, ...source.filter((alumni) => !curatedAlumni.some((curated) => curated.name === alumni.name && curated.graduationYear === alumni.graduationYear && curated.university === alumni.university))];
  return limit ? result.slice(0, limit) : result;
}

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.summary,
    category: row.category,
    authorName: row.alumni_profiles?.name ?? "枣友",
    authorId: row.alumni_profiles?.id,
    graduationYear: row.alumni_profiles?.graduation_year ?? new Date(row.created_at).getFullYear(),
    readTime: `${Math.max(1, Math.ceil(row.content.length / 500))} 分钟`,
    submittedAt: formatSubmittedAt(row.created_at),
    likeCount: 0,
    favoriteCount: 0,
    paragraphs: row.content.split(/\n\s*\n/).filter(Boolean),
  };
}

function toAlumni(row: AlumniRow): Alumni {
  return {
    id: row.id,
    name: row.name,
    graduationYear: row.graduation_year,
    className: row.class_name ?? "",
    university: row.university,
    college: row.school ?? "",
    major: row.major,
    city: row.city,
    country: row.country,
    stage: row.education_level,
    direction: row.research_direction ?? "",
    tags: row.tags ?? [],
    intro: row.short_intro || row.bio || "",
    gaokaoYear: row.graduation_year,
    gaokaoProvince: "",
    gaokaoType: "",
    gaokaoScore: 0,
    gaokaoRank: 0,
    showScore: false,
    showRank: false,
    admittedUniversity: row.university,
    admittedMajor: row.major,
    studyAdvice: "",
    examAdvice: "",
    applicationAdvice: "",
    majorAdvice: "",
    messageToStudents: row.bio ?? "",
    contact: row.contact ?? "",
    showContact: Boolean(row.show_contact && row.contact),
  };
}

function formatSubmittedAt(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}
