import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { AlumniProfileForm } from "@/components/forms/AlumniProfileForm";
import { getMyAlumniProfile, getMyProfile } from "@/lib/supabase/queries";

export default async function ApplyPage() {
  const [profile, alumniProfile] = await Promise.all([getMyProfile(), getMyAlumniProfile()]);
  return <AppShell showNav={false}><PageHeader title="编辑我的枣友名片" subtitle="完善你的大学、专业与成长经验，保存后直接公开展示。" backHref="/me" />
    {!profile ? <div className="rounded-[22px] bg-[#fffdf8] p-6 text-center shadow-sm"><p className="text-sm leading-6 text-[#78675e]">请先登录，再编辑你的枣友名片。</p><Link href="/auth" className="mt-4 block rounded-[16px] bg-[#7b2d26] px-4 py-3 text-sm font-semibold text-white">去登录</Link></div>
      : <><div className="mb-5 rounded-[18px] border-l-4 border-[#c9a45c] bg-[#f2eadc] p-4 text-[11px] leading-5 text-[#806c5e]">保存后内容会直接公开。请勿填写身份证号、手机号、家庭住址、准考证号等敏感信息。</div><AlumniProfileForm initial={alumniProfile} /></>}
  </AppShell>;
}
