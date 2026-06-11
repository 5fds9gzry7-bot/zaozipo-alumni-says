import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { duplicateKey, type ImportCandidate, type ImportResult } from "@/lib/import-mapping";
import { createAdminClient, isAdminSecretValid } from "@/lib/supabase/admin";

type RequestBody = {
  action: "preview" | "import";
  secret: string;
  filename: string;
  operator: string;
  candidates: ImportCandidate[];
  totalRows: number;
  skippedInvalid: number;
};

export async function POST(request: Request) {
  if (!process.env.ADMIN_IMPORT_SECRET) {
    return NextResponse.json({ error: "管理员密钥未配置，导入功能暂不可用。" }, { status: 503 });
  }

  const body = await request.json() as RequestBody;
  if (!isAdminSecretValid(body.secret)) {
    return NextResponse.json({ error: "管理员密钥不正确。" }, { status: 401 });
  }

  const supabase = createAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase 服务端环境变量未配置完整。" }, { status: 503 });
  }

  const { data: existing, error: existingError } = await supabase.from("alumni_profiles").select("name, graduation_year, university");
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 });

  const existingKeys = new Set((existing ?? []).map((item) => duplicateKey(item)));
  const seen = new Set<string>();
  const duplicateRows: number[] = [];
  const importable = body.candidates.filter((candidate) => {
    const key = duplicateKey(candidate.profile);
    if (existingKeys.has(key) || seen.has(key)) {
      duplicateRows.push(candidate.rowNumber);
      return false;
    }
    seen.add(key);
    return true;
  });

  if (body.action === "preview") {
    return NextResponse.json({ duplicateRows, importableRows: importable.map((item) => item.rowNumber) });
  }

  let insertedAlumni = 0;
  let insertedArticles = 0;
  for (const candidate of importable) {
    const { data: alumni, error: alumniError } = await supabase.from("alumni_profiles").insert(candidate.profile).select("id").single();
    if (alumniError) return NextResponse.json({ error: `第 ${candidate.rowNumber} 行枣友导入失败：${alumniError.message}` }, { status: 500 });
    insertedAlumni += 1;

    if (candidate.article) {
      const { error: articleError } = await supabase.from("articles").insert({ ...candidate.article, alumni_id: alumni.id });
      if (articleError) return NextResponse.json({ error: `第 ${candidate.rowNumber} 行文章导入失败：${articleError.message}` }, { status: 500 });
      insertedArticles += 1;
    }
  }

  const importedAt = new Date().toISOString();
  const result: ImportResult = {
    totalRows: body.totalRows,
    insertedAlumni,
    insertedArticles,
    skippedDuplicates: duplicateRows.length,
    skippedInvalid: body.skippedInvalid,
    filename: body.filename,
    importedAt,
  };
  const { error: logError } = await supabase.from("imports").insert({
    filename: body.filename,
    total_profiles: insertedAlumni,
    total_articles: insertedArticles,
    skipped_duplicates: duplicateRows.length,
    skipped_invalid: body.skippedInvalid,
    imported_at: importedAt,
    operator: body.operator || "管理员",
  });
  if (logError) return NextResponse.json({ error: `内容已导入，但导入日志写入失败：${logError.message}` }, { status: 500 });

  revalidatePath("/", "layout");
  return NextResponse.json(result);
}
