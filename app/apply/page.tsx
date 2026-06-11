"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AlumniProfileForm } from "@/components/forms/AlumniProfileForm";
import { createClient } from "@/lib/supabase/client";
import type { AlumniProfile } from "@/lib/supabase/types";

export default function ApplyPage() {
  const [initial, setInitial] = useState<AlumniProfile | null>(null);
  const [status, setStatus] = useState<"loading" | "guest" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = createClient();
      if (!supabase) {
        if (active) {
          setError("Supabase 环境变量未配置，暂时无法编辑名片。");
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

        const [profileResult, alumniResult] = await Promise.all([
          supabase.from("profiles").select("id").eq("id", auth.user.id).maybeSingle(),
          supabase.from("alumni_profiles").select("*").eq("user_id", auth.user.id).maybeSingle(),
        ]);
        if (profileResult.error) throw profileResult.error;
        if (alumniResult.error) throw alumniResult.error;
        if (!profileResult.data) throw new Error("未找到当前账号的个人资料，请稍后重试。");

        if (active) {
          setInitial(alumniResult.data as AlumniProfile | null);
          setStatus("ready");
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "加载名片失败，请稍后重试。");
          setStatus("error");
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  return <AppShell showNav={false}><PageHeader title="编辑我的枣友名片" subtitle="完善你的大学、专业与成长经验，保存后直接公开展示。" backHref="/me" />
    {status === "loading" && <StatusMessage message="正在加载登录状态..." />}
    {status === "error" && <StatusMessage message={error ?? "加载名片失败，请稍后重试。"} error />}
    {status === "guest" && <LoginPrompt message="请先登录，再编辑你的枣友名片。" />}
    {status === "ready" && <><div className="mb-5 rounded-[18px] border-l-4 border-[#c9a45c] bg-[#f2eadc] p-4 text-[11px] leading-5 text-[#806c5e]">保存后内容会直接公开。请勿填写身份证号、手机号、家庭住址、准考证号等敏感信息。</div><AlumniProfileForm initial={initial} /></>}
  </AppShell>;
}

function StatusMessage({ message, error = false }: { message: string; error?: boolean }) {
  return <p className={`rounded-[22px] p-6 text-center text-sm leading-6 shadow-sm ${error ? "bg-[#f3e5df] text-[#7b2d26]" : "bg-[#fffdf8] text-[#78675e]"}`}>{message}</p>;
}

function LoginPrompt({ message }: { message: string }) {
  return <div className="rounded-[22px] bg-[#fffdf8] p-6 text-center shadow-sm"><p className="text-sm leading-6 text-[#78675e]">{message}</p><Link href="/auth" className="mt-4 block rounded-[16px] bg-[#7b2d26] px-4 py-3 text-sm font-semibold text-white">去登录</Link></div>;
}
