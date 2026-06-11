import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ArticleForm } from "@/components/forms/ArticleForm";
import { getMyProfile } from "@/lib/supabase/queries";

export default async function SubmitArticlePage() {
  const profile = await getMyProfile();
  const canSubmit = profile?.status === "active";
  return <AppShell showNav={false}><PageHeader title="发布枣子经验" subtitle="登录用户都可以分享经验，提交后文章会直接公开。" backHref="/me" />
    {canSubmit ? <ArticleForm /> : <div className="rounded-[22px] bg-[#fffdf8] p-6 text-center shadow-sm"><p className="text-sm leading-6 text-[#78675e]">{profile ? "当前账号已被封禁，暂时无法投稿。" : "请先登录后发布文章。"}</p><Link href="/auth" className="mt-4 block rounded-[16px] bg-[#31594e] px-4 py-3 text-sm font-semibold text-white">去登录</Link></div>}
  </AppShell>;
}
