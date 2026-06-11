"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/supabase/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return <button onClick={() => startTransition(async () => { await signOut(); router.refresh(); })} disabled={pending} className="text-xs text-white/70">{pending ? "退出中..." : "退出登录"}</button>;
}
