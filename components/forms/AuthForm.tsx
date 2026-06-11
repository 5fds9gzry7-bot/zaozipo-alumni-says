"use client";

import { type FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActionResult } from "@/lib/supabase/types";
import { ResultMessage, TextField } from "./FormControls";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);

    try {
      const supabase = createClient();
      if (!supabase) {
        setResult({ ok: false, message: "Supabase 环境变量未配置，当前无法注册或登录。" });
        return;
      }

      const formData = new FormData(event.currentTarget);
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setResult({ ok: false, message: error.message });
          return;
        }
        window.location.href = "/me";
        return;
      }

      const displayName = String(formData.get("displayName") ?? "").trim();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/me`,
        },
      });
      if (error) {
        setResult({ ok: false, message: error.message });
        return;
      }
      if (data.session) {
        window.location.href = "/me";
        return;
      }
      setResult({ ok: true, message: "注册成功，请检查邮箱确认邮件；如果已关闭邮箱确认，请直接登录。" });
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "操作失败，请稍后重试。" });
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-[0_9px_25px_rgba(76,47,37,0.06)]">
      <div className="grid grid-cols-2 rounded-[18px] bg-[#f2ebe2] p-1">
        {(["login", "register"] as const).map((item) => <button type="button" key={item} onClick={() => { setMode(item); setResult(null); }} className={`rounded-[14px] px-4 py-3 text-xs font-semibold ${mode === item ? "bg-[#fffdf8] text-[#7b2d26] shadow-sm" : "text-[#8e7d73]"}`}>{item === "login" ? "登录" : "注册"}</button>)}
      </div>
      <form onSubmit={submit} className="mt-6 space-y-5">
        {mode === "register" && <TextField label="显示名称" name="displayName" required placeholder="你的姓名或昵称" />}
        <TextField label="邮箱" name="email" type="email" required placeholder="name@example.com" />
        <TextField label="密码" name="password" type="password" required minLength={6} placeholder="至少 6 位字符" />
        <ResultMessage result={result} />
        <button disabled={pending} className="w-full rounded-[18px] bg-[#7b2d26] px-5 py-4 text-sm font-semibold text-white shadow-md disabled:opacity-60">{pending ? "正在处理..." : mode === "login" ? "登录枣篮" : "创建账号"}</button>
      </form>
    </section>
  );
}
