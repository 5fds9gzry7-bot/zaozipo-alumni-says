export type ImportProfile = {
  name: string;
  graduation_year: number;
  class_name: string;
  university: string;
  school: string;
  major: string;
  city: string;
  country: string;
  education_level: string;
  research_direction: string;
  tags: string[];
  short_intro: string;
  bio: string;
  gaokao_year: number | null;
  gaokao_province: string;
  gaokao_type: string;
  gaokao_score: number | null;
  gaokao_rank: number | null;
  admitted_university: string;
  admitted_major: string;
  show_score: boolean;
  show_rank: boolean;
  published: boolean;
};

export type ImportCandidate = {
  rowNumber: number;
  profile: ImportProfile;
  article: {
    title: string;
    category: string;
    summary: string;
    content: string;
    published: boolean;
  } | null;
};

export type PreviewStatus = "新增" | "重复" | "缺少关键信息";
export type PreviewRow = {
  rowNumber: number;
  candidate: ImportCandidate | null;
  name: string;
  graduationYear: number | null;
  university: string;
  major: string;
  city: string;
  articleTitle: string;
  category: string;
  status: PreviewStatus;
  detail: "缺少关键信息" | "仅生成名片" | "同时生成名片和文章";
};

export type ImportResult = {
  totalRows: number;
  insertedAlumni: number;
  insertedArticles: number;
  skippedDuplicates: number;
  skippedInvalid: number;
  filename: string;
  importedAt: string;
};

export const questionnaireFieldMap = {
  name: ["姓名 / 昵称", "姓名/昵称", "昵称 / 姓名", "昵称/姓名", "姓名", "昵称"],
  graduation_year: ["毕业年份", "毕业年级", "届别"],
  class_name: ["当年班级", "班级（可选）", "班级(可选)", "班级"],
  university: ["当前大学 / 机构", "当前大学/机构", "当前大学", "大学", "机构"],
  school: ["学院", "院系"],
  major: ["当前专业", "专业"],
  city: ["所在城市", "城市"],
  country: ["国家 / 地区", "国家/地区", "国家", "地区"],
  education_level: ["学历阶段", "学历 / 职业阶段", "学历/职业阶段"],
  research_direction: ["研究 / 职业方向", "研究/职业方向", "职业方向", "研究方向"],
  tags: ["标签（逗号分隔）", "标签(逗号分隔)", "标签"],
  short_intro: ["一句话介绍", "简短介绍"],
  bio: ["个人简介", "简介"],
  gaokao_year: ["高考年份"],
  gaokao_province: ["高考省份"],
  gaokao_type: ["高考科类", "科类"],
  gaokao_score: ["高考总分", "高考分数"],
  gaokao_rank: ["省排名", "位次"],
  admitted_university: ["录取大学"],
  admitted_major: ["录取专业"],
  show_score: ["是否公开高考分数"],
  show_rank: ["是否公开省排名"],
  article_title: ["文章标题", "经验标题"],
  article_category: ["分类", "文章分类"],
  article_summary: ["文章摘要", "摘要"],
  article_content: ["正文内容", "正文", "经验分享"],
  article_public: ["是否公开", "公开"],
} as const;

export function previewQuestionnaireRows(rows: Record<string, unknown>[]): PreviewRow[] {
  return rows.map((row, index) => {
    const rowNumber = index + 2;
    const name = value(row, questionnaireFieldMap.name);
    const graduationYear = nullableNumber(value(row, questionnaireFieldMap.graduation_year));
    const university = value(row, questionnaireFieldMap.university);
    const major = value(row, questionnaireFieldMap.major);
    const city = value(row, questionnaireFieldMap.city);
    const articleTitle = value(row, questionnaireFieldMap.article_title);
    const category = value(row, questionnaireFieldMap.article_category);
    const candidate = mapQuestionnaireRow(row, rowNumber);

    return {
      rowNumber,
      candidate,
      name,
      graduationYear,
      university,
      major,
      city,
      articleTitle,
      category,
      status: candidate ? "新增" : "缺少关键信息",
      detail: !candidate ? "缺少关键信息" : candidate.article ? "同时生成名片和文章" : "仅生成名片",
    };
  });
}

export function mapQuestionnaireRow(row: Record<string, unknown>, rowNumber = 0): ImportCandidate | null {
  const name = value(row, questionnaireFieldMap.name);
  const graduationYear = nullableNumber(value(row, questionnaireFieldMap.graduation_year));
  const university = value(row, questionnaireFieldMap.university);
  const major = value(row, questionnaireFieldMap.major);
  if (!name || graduationYear === null || !university || !major) return null;

  const articleTitle = value(row, questionnaireFieldMap.article_title);
  const articleContent = value(row, questionnaireFieldMap.article_content);
  const summary = value(row, questionnaireFieldMap.article_summary);

  return {
    rowNumber,
    profile: {
      name,
      graduation_year: graduationYear,
      class_name: value(row, questionnaireFieldMap.class_name),
      university,
      school: value(row, questionnaireFieldMap.school),
      major,
      city: value(row, questionnaireFieldMap.city),
      country: value(row, questionnaireFieldMap.country) || "中国",
      education_level: value(row, questionnaireFieldMap.education_level),
      research_direction: value(row, questionnaireFieldMap.research_direction),
      tags: splitTags(value(row, questionnaireFieldMap.tags)),
      short_intro: value(row, questionnaireFieldMap.short_intro),
      bio: value(row, questionnaireFieldMap.bio),
      gaokao_year: nullableNumber(value(row, questionnaireFieldMap.gaokao_year)),
      gaokao_province: value(row, questionnaireFieldMap.gaokao_province),
      gaokao_type: value(row, questionnaireFieldMap.gaokao_type),
      gaokao_score: nullableNumber(value(row, questionnaireFieldMap.gaokao_score)),
      gaokao_rank: nullableNumber(value(row, questionnaireFieldMap.gaokao_rank)),
      admitted_university: value(row, questionnaireFieldMap.admitted_university),
      admitted_major: value(row, questionnaireFieldMap.admitted_major),
      show_score: booleanValue(value(row, questionnaireFieldMap.show_score)),
      show_rank: booleanValue(value(row, questionnaireFieldMap.show_rank)),
      published: true,
    },
    article: articleTitle && articleContent ? {
      title: articleTitle,
      category: value(row, questionnaireFieldMap.article_category) || "大学生活",
      summary: summary || generateSummary(articleContent),
      content: articleContent,
      published: booleanValue(value(row, questionnaireFieldMap.article_public), true),
    } : null,
  };
}

export function duplicateKey(profile: Pick<ImportProfile, "name" | "graduation_year" | "university">) {
  return [profile.name, profile.graduation_year, profile.university].map((item) => String(item).trim().toLowerCase()).join("|");
}

export function generateSummary(content: string) {
  const cleaned = content.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  return `${cleaned.slice(0, 100)}……`;
}

function value(row: Record<string, unknown>, aliases: readonly string[]) {
  for (const alias of aliases) {
    const found = row[alias];
    if (found !== undefined && found !== null && String(found).trim()) return String(found).trim();
  }
  return "";
}

function splitTags(input: string) {
  return input.split(/[,，、\s]+/).map((item) => item.trim()).filter(Boolean);
}

function nullableNumber(input: string) {
  if (!input) return null;
  const match = input.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function booleanValue(input: string, defaultValue = false) {
  if (!input) return defaultValue;
  const normalized = input.trim().toLowerCase();
  if (["是", "公开", "yes", "true", "1"].includes(normalized)) return true;
  if (["否", "不公开", "no", "false", "0"].includes(normalized)) return false;
  return defaultValue;
}
