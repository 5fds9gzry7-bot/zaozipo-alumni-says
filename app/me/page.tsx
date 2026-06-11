"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { ArticleCard } from "@/components/ArticleCard";
import { BrandMark } from "@/components/BrandMark";
import { PageHeader } from "@/components/PageHeader";
import { SignOutButton } from "@/components/forms/SignOutButton";
import type { Article } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase/client";
import type { AlumniProfile, ArticleRecord, Profile } from "@/lib/supabase/types";

type ArticleQueryRow = ArticleRecord & {
  profiles: { display_name: string | null } | null;
  alumni_profiles: { display_name: string; graduation_year: number } | null;
};

type MeData = {
  profile: Profile | null;
  alumniProfile: AlumniProfile | null;
  myArticles: ArticleRecord[];
  favorites: Article[];
};

const emptyData: MeData = { profile: null, alumniProfile: null, myArticles: [], favorites: [] };

export default function MePage() {
  const [data, setData] = useState<MeData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      if (!supabase) {
        if (active) {
          setError("Supabase 环境变量未配置。");
          setLoading(false);
        }
        return;
      }

      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError && !authError.message.includes("Auth session missing")) throw authError;
        if (!auth.user) {
          if (active) setLoading(false);
          return;
        }

        const [profileResult, alumniResult, articlesResult, favoritesResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle(),
          supabase.from("alumni_profiles").select("*").eq("user_id", auth.user.id).maybeSingle(),
          supabase.from("articles").select("*").eq("author_id", auth.user.id).order("created_at", { ascending: false }),
          supabase.from("article_favorites").select("articles(*, profiles!articles_author_id_fkey(display_name), alumni_profiles(display_name, graduation_year))").eq("user_id", auth.user.id),
        ]);

        const queryError = profileResult.error || alumniResult.error || articlesResult.error || favoritesResult.error;
        if (queryError) throw queryError;

        const profile = (profileResult.data as Profile | null) ?? {
          id: auth.user.id,
          email: auth.user.email ?? null,
          display_name: String(auth.user.user_metadata.display_name ?? ""),
          avatar_url: null,
          role: "user",
          status: "active",
          created_at: auth.user.created_at,
          updated_at: auth.user.updated_at ?? auth.user.created_at,
        };
        const favoriteRows = (favoritesResult.data ?? []) as unknown as { articles: ArticleQueryRow | null }[];

        if (active) {
          setData({
            profile,
            alumniProfile: alumniResult.data as AlumniProfile | null,
            myArticles: (articlesResult.data ?? []) as ArticleRecord[],
            favorites: favoriteRows.flatMap((row) => row.articles ? [toArticle(row.articles)] : []),
          });
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "加载个人页面失败。");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <AppShell><PageHeader title="我的枣篮" /><p className="rounded-[20px] bg-[#fffdf8] p-6 text-center text-xs text-[#8a786d]">正在加载登录状态...</p></AppShell>;
  }

  if (!data.profile) {
    return <AppShell><PageHeader title="我的枣篮" />{error && <ErrorMessage message={error} />}<section className="rounded-[28px] bg-[linear-gradient(145deg,#31594e,#24483f)] p-5 text-white shadow-lg"><div className="flex items-center gap-4"><BrandMark size="lg" inverted /><div><p className="font-serif text-xl font-bold">未登录</p><p className="mt-1 text-xs leading-5 text-white/70">登录后可编辑名片、发布文章、点赞与收藏。</p></div></div></section><div className="mt-6 grid gap-3"><Action href="/auth" title="登录 / 注册" desc="注册即成为枣友，无需等待审核。" /><Action href="/guide" title="使用指南" desc="了解平台定位、内容规范与隐私保护。" /></div></AppShell>;
  }

  const { profile, alumniProfile, myArticles, favorites } = data;
  const isAdmin = ["admin", "super_admin"].includes(profile.role);

  return <AppShell><PageHeader title="我的枣篮" />{error && <ErrorMessage message={error} />}<section className="rounded-[28px] bg-[linear-gradient(145deg,#31594e,#24483f)] p-5 text-white shadow-lg"><div className="flex items-center gap-4"><BrandMark size="lg" inverted /><div className="min-w-0 flex-1"><p className="truncate font-serif text-xl font-bold">{profile.display_name || "枣友用户"}</p><p className="mt-1 truncate text-xs text-white/65">{profile.email}</p><div className="mt-3 flex items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">{profile.role}</span><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">{profile.status}</span></div></div><SignOutButton /></div></section>
    <div className="mt-6 grid gap-3"><Action href="/apply" title="编辑我的枣友名片" desc={alumniProfile ? "名片已公开，可随时更新。" : "完善你的公开枣友名片。"} /><Action href="/submit-article" title="发布经验文章" desc="文章提交后直接公开展示。" />{isAdmin && <Action href="/admin" title="枣园管理" desc="隐藏内容、封禁用户、处理举报。" />}<Action href="/guide" title="使用指南" desc="了解平台规则与内容边界。" /><Action href="/debug" title="连接调试" desc="查看登录状态和 Supabase 数据连接。" /></div>
    <Section title={`我的文章 · ${myArticles.length}`}>{myArticles.length ? myArticles.map((item) => <div key={item.id} className="rounded-[18px] bg-[#fffdf8] p-4 text-sm"><p className="font-semibold">{item.title}</p><p className="mt-2 text-xs text-[#8c7a70]">状态：{item.status}</p></div>) : <Empty text="还没有发布文章。" />}</Section>
    <Section title={`我的收藏 · ${favorites.length}`}>{favorites.length ? favorites.map((item) => <ArticleCard key={item.id} article={item} />) : <Empty text="枣篮还是空的，去收藏想反复阅读的经验吧。" />}</Section>
  </AppShell>;
}

function toArticle(row: ArticleQueryRow): Article {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    authorName: row.alumni_profiles?.display_name || row.profiles?.display_name || "枣友",
    graduationYear: row.alumni_profiles?.graduation_year ?? new Date(row.created_at).getFullYear(),
    readTime: row.read_time,
    likeCount: row.like_count,
    favoriteCount: row.favorite_count,
    paragraphs: row.content.split(/\n\s*\n/).filter(Boolean),
  };
}

function ErrorMessage({ message }: { message: string }) { return <p className="mb-4 rounded-[16px] bg-[#f3e5df] px-4 py-3 text-xs leading-5 text-[#7b2d26]">{message}</p>; }
function Action({ href, title, desc }: { href: string; title: string; desc: string }) { return <Link href={href} className="flex items-center justify-between gap-4 rounded-[22px] border border-[#e7dbcf] bg-[#fffdf8] p-4 shadow-sm"><span><span className="block text-sm font-semibold text-[#4b3830]">{title}</span><span className="mt-1 block text-[11px] leading-5 text-[#95857b]">{desc}</span></span><span className="text-[#b19a85]">→</span></Link>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-8"><h2 className="mb-4 font-serif text-lg font-bold">{title}</h2><div className="space-y-3">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="rounded-[20px] border border-dashed border-[#d8c8b8] p-6 text-center text-xs text-[#8a786d]">{text}</p>; }
