import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { createAdminClient, isAdminSecretValid } from "@/lib/supabase/admin";

type RequestBody = {
  secret: string;
  action?: "load" | "manage" | "delete-import";
  table?: "alumni_profiles" | "articles";
  id?: string;
  contentAction?: "hide" | "publish" | "delete";
};

export async function POST(request: Request) {
  if (!process.env.ADMIN_IMPORT_SECRET) {
    return NextResponse.json({ error: "管理员密钥未配置，后台功能暂不可用。" }, { status: 503 });
  }
  const body = await request.json() as RequestBody;
  if (!isAdminSecretValid(body.secret)) return NextResponse.json({ error: "管理员密钥不正确。" }, { status: 401 });
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase 服务端环境变量未配置完整。" }, { status: 503 });

  if (body.action === "manage" && body.table && body.id && body.contentAction) {
    const query = body.contentAction === "delete"
      ? supabase.from(body.table).delete().eq("id", body.id)
      : supabase.from(body.table).update({ published: body.contentAction === "publish" }).eq("id", body.id);
    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    revalidatePath("/", "layout");
  }

  if (body.action === "delete-import" && body.id) {
    const { error } = await supabase.from("imports").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const [alumniCount, articleCount, universities, imports, alumni, articles, alumniStatus, articleStatus] = await Promise.all([
    supabase.from("alumni_profiles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("alumni_profiles").select("university"),
    supabase.from("imports").select("*").order("imported_at", { ascending: false }).limit(20),
    supabase.from("alumni_profiles").select("id, name, university, major, published").order("updated_at", { ascending: false }).limit(12),
    supabase.from("articles").select("id, title, category, published").order("updated_at", { ascending: false }).limit(12),
    supabase.from("alumni_profiles").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("articles").select("updated_at").order("updated_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const error = alumniCount.error || articleCount.error || universities.error || imports.error || alumni.error || articles.error || alumniStatus.error || articleStatus.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    stats: {
      alumni: alumniCount.count ?? 0,
      articles: articleCount.count ?? 0,
      universities: new Set((universities.data ?? []).map((item) => item.university)).size,
      lastUpdated: latestDate([alumniStatus.data?.updated_at, articleStatus.data?.updated_at, imports.data?.[0]?.imported_at]),
    },
    system: {
      supabase: "正常",
      edgeOneVersion: process.env.EDGEONE_VERSION || process.env.NEXT_PUBLIC_DEPLOY_VERSION || "v1.1",
      environment: "Production",
    },
    imports: imports.data ?? [],
    alumni: alumni.data ?? [],
    articles: articles.data ?? [],
  });
}

function latestDate(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value)).sort((a, b) => Date.parse(b) - Date.parse(a))[0] ?? null;
}
