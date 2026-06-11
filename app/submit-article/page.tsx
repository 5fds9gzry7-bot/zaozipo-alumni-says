"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { ArticleForm } from "@/components/forms/ArticleForm";
import { createClient } from "@/lib/supabase/client";
import type { ProfileStatus } from "@/lib/supabase/types";

export default function SubmitArticlePage() {
  const [status, setStatus] = useState<"loading" | "guest" | "active" | "banned" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      if (!supabase) {
        if (active) {
          setError("Supabase 环境变量未配置，暂时无法发布文章。");
          setStatus("error");
        }
        return;
      }

      try {
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError && !authError.message.includes("Auth session missing")) throw authError;
        if (!auth.user) {
          if (active) setStatus("guest");
          return;
        }

        const { data: profile, error: profileError } = await supabase.from("profiles").select("status").eq("id", auth.user.id).maybeSingle();
        if (profileError) throw profileError;
        if (!profile) throw new Error("未找到当前账号的个人资料，请稍后重试。");
        if (active) setStatus((profile.status as ProfileStatus) === "active" ? "active" : "banned");
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "加载发布页面失败，请稍后重试。");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return <AppShell showNav={false}><PageHeader title="发布枣子经验" subtitle="登录用户都可以分享经验，提交后文章会直接公开。" backHref="/me" />
    {status === "loading" && <Message text="正在加载登录状态..." />}
    {status === "error" && <Message text={error ?? "加载发布页面失败，请稍后重试。"} error />}
    {status === "guest" && <LoginPrompt text="请先登录后发布文章。" />}
    {status === "banned" && <Message text="当前账号已被封禁，暂时无法投稿。" error />}
    {status === "active" && <ArticleForm />}
  </AppShell>;
}

function Message({ text, error = false }: { text: string; error?: boolean }) {
  return <p className={`rounded-[22px] p-6 text-center text-sm leading-6 shadow-sm ${error ? "bg-[#f3e5df] text-[#7b2d26]" : "bg-[#fffdf8] text-[#78675e]"}`}>{text}</p>;
}

function LoginPrompt({ text }: { text: string }) {
  return <div className="rounded-[22px] bg-[#fffdf8] p-6 text-center shadow-sm"><p className="text-sm leading-6 text-[#78675e]">{text}</p><Link href="/auth" className="mt-4 block rounded-[16px] bg-[#31594e] px-4 py-3 text-sm font-semibold text-white">去登录</Link></div>;
}
