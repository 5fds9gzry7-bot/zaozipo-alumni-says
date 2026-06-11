"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "./server";
import type { ActionResult, ReportTargetType } from "./types";

const unavailable: ActionResult = { ok: false, message: "Supabase 环境变量未配置，请先配置 .env.local。" };
const unauthenticated: ActionResult = { ok: false, message: "请先登录后再继续。" };

export async function signInWithEmail(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.signInWithPassword({ email: text(formData, "email"), password: text(formData, "password") });
  if (error) return { ok: false, message: authError(error.message) };
  revalidatePath("/", "layout");
  return { ok: true, message: "登录成功，欢迎回来。" };
}

export async function signUpWithEmail(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { data, error } = await supabase.auth.signUp({
    email: text(formData, "email"), password: text(formData, "password"),
    options: { data: { display_name: text(formData, "displayName") } },
  });
  if (error) return { ok: false, message: authError(error.message) };
  revalidatePath("/", "layout");
  return data.session
    ? { ok: true, message: "注册成功，你已成为枣友并自动登录。" }
    : { ok: true, message: "注册成功，请查收验证邮件后登录。" };
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { error } = await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return error ? { ok: false, message: error.message } : { ok: true, message: "已退出登录。" };
}

export async function submitAlumniProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return unauthenticated;
  const payload = alumniPayload(formData, auth.user.id);
  const { data: existing } = await supabase.from("alumni_profiles").select("id").eq("user_id", auth.user.id).maybeSingle();
  const { error } = existing
    ? await supabase.from("alumni_profiles").update(payload).eq("user_id", auth.user.id)
    : await supabase.from("alumni_profiles").insert(payload);
  revalidatePath("/", "layout");
  return error ? { ok: false, message: error.message } : { ok: true, message: "枣友名片已保存并公开展示。" };
}
export const updateMyAlumniProfile = submitAlumniProfile;

export async function submitArticle(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return unauthenticated;
  const { data: profile } = await supabase.from("profiles").select("status").eq("id", auth.user.id).maybeSingle();
  if (profile?.status === "banned") return { ok: false, message: "当前账号已被封禁，无法投稿。" };
  const { data: alumniProfile } = await supabase.from("alumni_profiles").select("id").eq("user_id", auth.user.id).maybeSingle();
  const content = text(formData, "content");
  const { error } = await supabase.from("articles").insert({
    author_id: auth.user.id, alumni_profile_id: alumniProfile?.id ?? null, title: text(formData, "title"),
    excerpt: text(formData, "excerpt"), content, category: text(formData, "category"), tags: tags(formData),
    status: "published", read_time: `${Math.max(1, Math.ceil(content.length / 500))} 分钟`, published_at: new Date().toISOString(),
  });
  revalidatePath("/", "layout");
  return error ? { ok: false, message: error.message } : { ok: true, message: "文章已发布，其他枣友现在可以看到它。" };
}

export async function toggleArticleLike(articleId: string) { return toggleRelation("article_likes", articleId); }
export async function toggleArticleFavorite(articleId: string) { return toggleRelation("article_favorites", articleId); }
async function toggleRelation(table: "article_likes" | "article_favorites", articleId: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return unauthenticated;
  const { data: existing } = await supabase.from(table).select("id").eq("article_id", articleId).eq("user_id", auth.user.id).maybeSingle();
  const { error } = existing ? await supabase.from(table).delete().eq("id", existing.id) : await supabase.from(table).insert({ article_id: articleId, user_id: auth.user.id });
  revalidatePath(`/articles/${articleId}`); revalidatePath("/me");
  return error ? { ok: false, message: error.message } : { ok: true, message: existing ? "已取消。" : "已保存。" };
}

export async function createReport(formData: FormData): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return unavailable;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return unauthenticated;
  const { error } = await supabase.from("reports").insert({ reporter_id: auth.user.id, target_type: text(formData, "targetType") as ReportTargetType, target_id: text(formData, "targetId"), reason: text(formData, "reason"), detail: text(formData, "detail") });
  return error ? { ok: false, message: error.message } : { ok: true, message: "举报已提交。" };
}

export async function adminHideAlumniProfile(id: string, note: string) { return adminHide("alumni_profiles", id, note); }
export async function adminHideArticle(id: string, note: string) { return adminHide("articles", id, note); }
export async function adminPublishAlumniProfile(id: string) { return adminPublish("alumni_profiles", id); }
export async function adminPublishArticle(id: string) { return adminPublish("articles", id); }

async function adminHide(table: "articles" | "alumni_profiles", id: string, note: string): Promise<ActionResult> {
  const context = await adminContext(); if (!context) return { ok: false, message: "无管理员权限。" };
  const { error } = await context.supabase.from(table).update({ status: "hidden" }).eq("id", id);
  if (!error) await logAdmin(context.supabase, context.userId, `hide_${table}`, table, id, note);
  revalidatePath("/", "layout"); return error ? { ok: false, message: error.message } : { ok: true, message: "内容已隐藏。" };
}
async function adminPublish(table: "articles" | "alumni_profiles", id: string): Promise<ActionResult> {
  const context = await adminContext(); if (!context) return { ok: false, message: "无管理员权限。" };
  const { error } = await context.supabase.from(table).update({ status: "published" }).eq("id", id);
  if (!error) await logAdmin(context.supabase, context.userId, `publish_${table}`, table, id, "恢复公开");
  revalidatePath("/", "layout"); return error ? { ok: false, message: error.message } : { ok: true, message: "内容已恢复公开。" };
}
export async function adminResolveReport(id: string, note: string): Promise<ActionResult> {
  const context = await adminContext(); if (!context) return { ok: false, message: "无管理员权限。" };
  const { error } = await context.supabase.from("reports").update({ status: "resolved", handled_by: context.userId, handled_at: new Date().toISOString() }).eq("id", id);
  if (!error) await logAdmin(context.supabase, context.userId, "resolve_report", "reports", id, note);
  revalidatePath("/admin"); return error ? { ok: false, message: error.message } : { ok: true, message: "举报已处理。" };
}
export async function adminSetUserBanned(id: string, banned: boolean): Promise<ActionResult> {
  const context = await adminContext(); if (!context) return { ok: false, message: "无管理员权限。" };
  const { error } = await context.supabase.rpc("admin_set_user_status", { target_user_id: id, next_status: banned ? "banned" : "active" });
  if (!error) await logAdmin(context.supabase, context.userId, banned ? "ban_user" : "activate_user", "profiles", id, banned ? "封禁用户" : "恢复用户");
  revalidatePath("/admin"); return error ? { ok: false, message: error.message } : { ok: true, message: banned ? "用户已封禁。" : "用户已恢复。" };
}

async function adminContext() {
  const supabase = await createSupabaseServerClient(); if (!supabase) return null;
  const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
  return profile && ["admin", "super_admin"].includes(profile.role) ? { supabase, userId: auth.user.id } : null;
}
async function logAdmin(supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>, adminId: string, actionType: string, targetType: string, targetId: string, note: string) {
  await supabase.from("admin_actions").insert({ admin_id: adminId, action_type: actionType, target_type: targetType, target_id: targetId, note });
}
function alumniPayload(formData: FormData, userId: string) { return { user_id: userId, display_name: text(formData, "display_name"), graduation_year: number(formData, "graduation_year"), class_name: text(formData, "class_name"), university: text(formData, "university"), college: text(formData, "college"), major: text(formData, "major"), city: text(formData, "city"), country: text(formData, "country") || "中国", stage: text(formData, "stage"), direction: text(formData, "direction"), tags: tags(formData), intro: text(formData, "intro"), gaokao_year: nullableNumber(formData, "gaokao_year"), gaokao_province: text(formData, "gaokao_province"), gaokao_type: text(formData, "gaokao_type"), gaokao_score: nullableNumber(formData, "gaokao_score"), gaokao_rank: nullableNumber(formData, "gaokao_rank"), show_score: formData.get("show_score") === "on", show_rank: formData.get("show_rank") === "on", admitted_university: text(formData, "admitted_university"), admitted_major: text(formData, "admitted_major"), study_advice: text(formData, "study_advice"), exam_advice: text(formData, "exam_advice"), application_advice: text(formData, "application_advice"), major_advice: text(formData, "major_advice"), message_to_students: text(formData, "message_to_students"), contact: text(formData, "contact"), show_contact: formData.get("show_contact") === "on", status: "published" }; }
function text(formData: FormData, name: string) { return String(formData.get(name) ?? "").trim(); }
function number(formData: FormData, name: string) { return Number(text(formData, name)); }
function nullableNumber(formData: FormData, name: string) { const value = text(formData, name); return value ? Number(value) : null; }
function tags(formData: FormData) { return text(formData, "tags").split(/[，,]/).map((tag) => tag.trim()).filter(Boolean); }
function authError(message: string) { if (message.includes("Invalid login credentials")) return "邮箱或密码不正确。"; if (message.includes("Email not confirmed")) return "请先打开验证邮件确认邮箱。"; if (message.includes("User already registered")) return "该邮箱已经注册，请直接登录。"; return message; }
