import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { BrandMark } from "@/components/BrandMark";
import { PageHeader } from "@/components/PageHeader";
import { ArticleCard } from "@/components/ArticleCard";
import { SignOutButton } from "@/components/forms/SignOutButton";
import { getMyAlumniProfile, getMyArticles, getMyFavorites, getMyProfile } from "@/lib/supabase/queries";

export default async function MePage() {
  const [profile, alumniProfile, myArticles, favorites] = await Promise.all([getMyProfile(), getMyAlumniProfile(), getMyArticles(), getMyFavorites()]);
  if (!profile) return <AppShell><PageHeader title="我的枣篮" /><section className="rounded-[28px] bg-[linear-gradient(145deg,#31594e,#24483f)] p-5 text-white shadow-lg"><div className="flex items-center gap-4"><BrandMark size="lg" inverted /><div><p className="font-serif text-xl font-bold">未登录</p><p className="mt-1 text-xs leading-5 text-white/70">登录后可编辑名片、发布文章、点赞与收藏。</p></div></div></section><div className="mt-6 grid gap-3"><Action href="/auth" title="登录 / 注册" desc="注册即成为枣友，无需等待审核。" /><Action href="/guide" title="使用指南" desc="了解平台定位、内容规范与隐私保护。" /></div></AppShell>;
  const isAdmin = ["admin", "super_admin"].includes(profile.role);
  return <AppShell><PageHeader title="我的枣篮" /><section className="rounded-[28px] bg-[linear-gradient(145deg,#31594e,#24483f)] p-5 text-white shadow-lg"><div className="flex items-center gap-4"><BrandMark size="lg" inverted /><div className="min-w-0 flex-1"><p className="truncate font-serif text-xl font-bold">{profile.display_name || "枣友用户"}</p><p className="mt-1 truncate text-xs text-white/65">{profile.email}</p><div className="mt-3 flex items-center gap-2"><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">{profile.role}</span><span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold">{profile.status}</span></div></div><SignOutButton /></div></section>
    <div className="mt-6 grid gap-3"><Action href="/apply" title="编辑我的枣友名片" desc={alumniProfile ? "名片已公开，可随时更新。" : "完善你的公开枣友名片。"} /><Action href="/submit-article" title="发布经验文章" desc="文章提交后直接公开展示。" />{isAdmin && <Action href="/admin" title="枣园管理" desc="隐藏内容、封禁用户、处理举报。" />}<Action href="/guide" title="使用指南" desc="了解平台规则与内容边界。" /><Action href="/debug" title="连接调试" desc="查看登录状态和 Supabase 数据连接。" /></div>
    <Section title={`我的文章 · ${myArticles.length}`}>{myArticles.length ? myArticles.map((item) => <div key={item.id} className="rounded-[18px] bg-[#fffdf8] p-4 text-sm"><p className="font-semibold">{item.title}</p><p className="mt-2 text-xs text-[#8c7a70]">状态：{item.status}</p></div>) : <Empty text="还没有发布文章。" />}</Section>
    <Section title={`我的收藏 · ${favorites.length}`}>{favorites.length ? favorites.map((item) => <ArticleCard key={item.id} article={item} />) : <Empty text="枣篮还是空的，去收藏想反复阅读的经验吧。" />}</Section>
  </AppShell>;
}
function Action({ href, title, desc }: { href: string; title: string; desc: string }) { return <Link href={href} className="flex items-center justify-between gap-4 rounded-[22px] border border-[#e7dbcf] bg-[#fffdf8] p-4 shadow-sm"><span><span className="block text-sm font-semibold text-[#4b3830]">{title}</span><span className="mt-1 block text-[11px] leading-5 text-[#95857b]">{desc}</span></span><span className="text-[#b19a85]">→</span></Link>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-8"><h2 className="mb-4 font-serif text-lg font-bold">{title}</h2><div className="space-y-3">{children}</div></section>; }
function Empty({ text }: { text: string }) { return <p className="rounded-[20px] border border-dashed border-[#d8c8b8] p-6 text-center text-xs text-[#8a786d]">{text}</p>; }
