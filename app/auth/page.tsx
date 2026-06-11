import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AuthForm } from "@/components/forms/AuthForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function AuthPage() {
  return <AppShell showNav={false}><PageHeader title="登录枣篮" subtitle="使用邮箱登录或创建账号，注册即成为枣友。" backHref="/me" />{!isSupabaseConfigured() && <p className="mb-4 rounded-[16px] bg-[#f3e5df] px-4 py-3 text-xs leading-5 text-[#7b2d26]">Supabase 环境变量未配置，当前无法注册或登录。请配置 `.env.local` 后重启开发服务器。</p>}<AuthForm /><p className="mt-5 text-center text-[11px] leading-5 text-[#9b8a80]">注册即表示你愿意遵守平台内容规范并尊重他人隐私。</p></AppShell>;
}
