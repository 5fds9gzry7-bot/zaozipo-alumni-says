import { basename, resolve } from "node:path";
import { access } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import mammoth from "mammoth";

const defaultBaseUrl = "https://zaozipo-alumni-says-dpnly1hj5jgo.zh-cn.edgeone.cool";
const args = process.argv.slice(2);
const docxPath = args.find((arg) => !arg.startsWith("--"));
const option = (name) => args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const dryRun = args.includes("--dry-run");

if (!docxPath) {
  console.error('用法：npm run import:docx -- "C:\\路径\\问卷结果.docx"');
  process.exit(1);
}

const absolutePath = resolve(docxPath);
await access(absolutePath);

const candidate = await parseQuestionnaireDocx(absolutePath);
const baseUrl = (option("url") || process.env.IMPORT_BASE_URL || defaultBaseUrl).replace(/\/$/, "");
let secret = option("secret") || process.env.ADMIN_IMPORT_SECRET || "";
const operator = option("operator") || process.env.IMPORT_OPERATOR || "DOCX 自动导入";

console.log(JSON.stringify({
  name: candidate.profile.name,
  graduationYear: candidate.profile.graduation_year,
  university: candidate.profile.university,
  major: candidate.profile.major,
  articleTitle: candidate.article?.title ?? "仅生成枣友名片",
}, null, 2));

if (dryRun) {
  console.log("预览完成：--dry-run 模式未上传数据。");
  process.exit(0);
}

if (!secret) {
  const terminal = createInterface({ input, output });
  secret = await terminal.question("请输入管理员密钥：");
  terminal.close();
}

if (!secret.trim()) throw new Error("管理员密钥不能为空。");

const payload = {
  secret,
  filename: basename(absolutePath),
  operator,
  candidates: [candidate],
  totalRows: 1,
  skippedInvalid: 0,
};

try {
  const preview = await requestImport(baseUrl, { ...payload, action: "preview" });
  if (!preview.importableRows?.length) {
    console.log("这份问卷对应的枣友已经存在，未重复上传。");
    process.exit(0);
  }

  const result = await requestImport(baseUrl, { ...payload, action: "import" });
  console.log(`上传完成：新增枣友 ${result.insertedAlumni} 位，新增文章 ${result.insertedArticles} 篇。`);
  console.log(`查看枣友：${baseUrl}/alumni`);
  console.log(`查看文章：${baseUrl}/articles`);
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  console.error(`上传失败：${reason}`);
  console.error("请检查网络和正式站点状态后重新运行；重复检测会避免重复导入。");
  process.exit(1);
}

async function requestImport(base, body) {
  const response = await fetch(`${base}/api/admin/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || `导入接口请求失败（${response.status}）。`);
  return result;
}

async function parseQuestionnaireDocx(path) {
  const { value: rawText } = await mammoth.extractRawText({ path });
  const paragraphs = rawText.split(/\r?\n\s*\r?\n/).map((item) => item.trim()).filter(Boolean);
  const answers = new Map();

  for (let index = 0; index < paragraphs.length; index += 1) {
    const match = paragraphs[index].match(/^\*\s*(\d+)\./);
    if (!match) continue;
    answers.set(Number(match[1]), paragraphs[index + 1]?.trim() || "");
  }

  const answer = (number) => answers.get(number) || "";
  const stripChoice = (value) => value.replace(/^[A-Z]\.\s*/, "").trim();
  const number = (value) => {
    const match = value.replaceAll(",", "").match(/\d+/);
    return match ? Number(match[0]) : null;
  };
  const tags = (value) => value.split(/[,，、\s]+/).map((item) => item.trim()).filter(Boolean);
  const graduationYear = number(answer(3));
  const publicFields = answer(10);
  const contentParts = [
    answer(25),
    answer(26) && `最想告诉学弟学妹：${answer(26)}`,
    answer(27) && `如果重新回到高三：${answer(27)}`,
    answer(29).includes("允许公开") && answer(28) && `联系方式：${answer(28)}`,
  ].filter(Boolean);
  const content = contentParts.join("\n\n");

  const profile = {
    name: answer(1),
    graduation_year: graduationYear,
    class_name: answer(4),
    university: answer(13),
    school: answer(14),
    major: answer(15),
    city: answer(16),
    country: answer(17) || "中国",
    education_level: stripChoice(answer(18)),
    research_direction: answer(19),
    tags: tags(answer(20)),
    short_intro: answer(21),
    bio: answer(21),
    gaokao_year: number(answer(5)),
    gaokao_province: answer(6),
    gaokao_type: answer(7),
    gaokao_score: number(answer(8)),
    gaokao_rank: number(answer(9)),
    admitted_university: answer(11),
    admitted_major: answer(12),
    show_score: publicFields.includes("高考总分"),
    show_rank: publicFields.includes("全省排名"),
    contact: answer(29).includes("允许公开") ? answer(28) : "",
    show_contact: answer(29).includes("允许公开"),
    published: true,
  };

  if (!profile.name || !profile.graduation_year || !profile.university || !profile.major) {
    throw new Error("Word 问卷缺少姓名、毕业年份、当前大学或当前专业，无法导入。");
  }

  return {
    rowNumber: 2,
    profile,
    article: answer(22) && content ? {
      title: answer(22),
      category: stripChoice(answer(23)) || "大学生活",
      summary: generateSummary(content),
      content,
      published: true,
    } : null,
  };
}

function generateSummary(content) {
  const cleaned = content.replace(/\s+/g, " ").trim();
  return cleaned ? `${cleaned.slice(0, 100)}……` : "";
}
