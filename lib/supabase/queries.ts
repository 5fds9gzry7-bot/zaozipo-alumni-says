import { createClient } from "@supabase/supabase-js";
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
};

type ArticleRow = {
  id: string;
  alumni_id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  created_at: string;
  alumni_profiles: { name: string; graduation_year: number } | null;
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
  if (!supabase) return fallbackArticles(limit);
  let query = supabase.from("articles").select("*, alumni_profiles(name, graduation_year)").eq("published", true).order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return fallbackArticles(limit);
  return (data as unknown as ArticleRow[]).map(toArticle);
}

export async function getPublishedArticleById(id: string): Promise<Article | null> {
  const supabase = getPublicClient();
  if (!supabase) return mockArticles.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase.from("articles").select("*, alumni_profiles(name, graduation_year)").eq("id", id).eq("published", true).maybeSingle();
  if (error) return mockArticles.find((item) => item.id === id) ?? null;
  return data ? toArticle(data as unknown as ArticleRow) : null;
}

export async function getPublishedAlumni(limit?: number): Promise<Alumni[]> {
  const supabase = getPublicClient();
  if (!supabase) return fallbackAlumni(limit);
  let query = supabase.from("alumni_profiles").select("*").eq("published", true).order("graduation_year", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) return fallbackAlumni(limit);
  return (data as unknown as AlumniRow[]).map(toAlumni);
}

export async function getPublishedAlumniById(id: string): Promise<Alumni | null> {
  const supabase = getPublicClient();
  if (!supabase) return mockAlumni.find((item) => item.id === id) ?? null;
  const { data, error } = await supabase.from("alumni_profiles").select("*").eq("id", id).eq("published", true).maybeSingle();
  if (error) return mockAlumni.find((item) => item.id === id) ?? null;
  return data ? toAlumni(data as unknown as AlumniRow) : null;
}

function fallbackArticles(limit?: number) { return limit ? mockArticles.slice(0, limit) : mockArticles; }
function fallbackAlumni(limit?: number) { return limit ? mockAlumni.slice(0, limit) : mockAlumni; }

function toArticle(row: ArticleRow): Article {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.summary,
    category: row.category,
    authorName: row.alumni_profiles?.name ?? "枣友",
    graduationYear: row.alumni_profiles?.graduation_year ?? new Date(row.created_at).getFullYear(),
    readTime: `${Math.max(1, Math.ceil(row.content.length / 500))} 分钟`,
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
    contact: "",
    showContact: false,
  };
}
