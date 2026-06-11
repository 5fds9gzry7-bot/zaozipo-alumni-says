"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    window.location.href = "/me";
  }

  return <button onClick={signOut} disabled={pending} className="text-xs text-white/70">{pending ? "退出中..." : "退出登录"}</button>;
}
