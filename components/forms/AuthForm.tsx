"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmail, signUpWithEmail } from "@/lib/supabase/actions";
import type { ActionResult } from "@/lib/supabase/types";
import { ResultMessage, TextField } from "./FormControls";

export function AuthForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submit(formData: FormData) {
    startTransition(async () => {
      const next = mode === "login" ? await signInWithEmail(formData) : await signUpWithEmail(formData);
      setResult(next);
      if (next.ok && (mode === "login" || next.message.includes("自动登录"))) {
        router.push("/me");
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-[24px] border border-[#e7dbcf] bg-[#fffdf8] p-5 shadow-[0_9px_25px_rgba(76,47,37,0.06)]">
      <div className="grid grid-cols-2 rounded-[18px] bg-[#f2ebe2] p-1">
        {(["login", "register"] as const).map((item) => <button type="button" key={item} onClick={() => { setMode(item); setResult(null); }} className={`rounded-[14px] px-4 py-3 text-xs font-semibold ${mode === item ? "bg-[#fffdf8] text-[#7b2d26] shadow-sm" : "text-[#8e7d73]"}`}>{item === "login" ? "登录" : "注册"}</button>)}
      </div>
      <form action={submit} className="mt-6 space-y-5">
        {mode === "register" && <TextField label="显示名称" name="displayName" required placeholder="你的姓名或昵称" />}
        <TextField label="邮箱" name="email" type="email" required placeholder="name@example.com" />
        <TextField label="密码" name="password" type="password" required minLength={6} placeholder="至少 6 位字符" />
        <ResultMessage result={result} />
        <button disabled={pending} className="w-full rounded-[18px] bg-[#7b2d26] px-5 py-4 text-sm font-semibold text-white shadow-md disabled:opacity-60">{pending ? "正在处理..." : mode === "login" ? "登录枣篮" : "创建账号"}</button>
      </form>
    </section>
  );
}
