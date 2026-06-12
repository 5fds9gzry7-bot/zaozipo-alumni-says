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
  contact: string;
  show_contact: boolean;
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
    created_at?: string;
  } | null;
};

export type PreviewStatus = "新增" | "更新" | "缺少关键信息";
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
  name: ["您的姓名（网名也可）是", "姓名 / 昵称", "姓名/昵称", "昵称 / 姓名", "昵称/姓名", "姓名", "昵称"],
  graduation_year: ["您的毕业年份是", "毕业年份", "毕业年级", "届别"],
  class_name: ["您高中所在班级是", "当年班级", "班级（可选）", "班级(可选)", "班级"],
  university: ["您当前所在大学或机构是", "当前大学 / 机构", "当前大学/机构", "当前大学", "大学", "机构"],
  school: ["您所在学院是", "学院", "院系"],
  major: ["您当前所学专业是", "当前专业", "专业"],
  city: ["您目前所在城市是", "所在城市", "城市"],
  country: ["您所在国家或地区是", "国家 / 地区", "国家/地区", "国家", "地区"],
  education_level: ["您当前所处阶段是", "学历阶段", "学历 / 职业阶段", "学历/职业阶段"],
  research_direction: ["您的研究方向或职业方向是", "研究 / 职业方向", "研究/职业方向", "职业方向", "研究方向"],
  tags: ["您认为哪些标签适合自己", "标签（逗号分隔）", "标签(逗号分隔)", "标签"],
  short_intro: ["请用一句话介绍自己", "一句话介绍", "简短介绍"],
  bio: ["个人简介", "简介"],
  gaokao_year: ["您的高考年份是", "高考年份"],
  gaokao_province: ["您所在省份是", "高考省份"],
  gaokao_type: ["您当时的选科组合是", "高考科类", "科类"],
  gaokao_score: ["您的高考总分是", "高考总分", "高考分数"],
  gaokao_rank: ["您的全省排名是", "省排名", "位次"],
  admitted_university: ["您当年录取就读的大学是", "录取大学"],
  admitted_major: ["您当年录取就读的专业是", "录取专业"],
  show_fields: ["您是否同意公开展示以下信息", "公开展示信息"],
  article_title: ["请填写本次经验分享的标题", "文章标题", "经验标题"],
  article_category: ["本次经验分享属于哪个类别", "分类", "文章分类"],
  article_summary: ["文章摘要", "摘要"],
  article_content: ["请详细分享您的经验、故事或建议", "正文内容", "正文", "经验分享"],
  message: ["如果用一句话概括，您最想告诉学弟学妹什么", "最想告诉学弟学妹"],
  retrospective: ["如果重新回到高三，您最想改变或提前知道的一件事是什么", "如果重新回到高三"],
  contact: ["联系方式（平台+ID", "联系方式"],
  contact_public: ["联系方式是否允许公开展示", "联系方式公开"],
  article_public: ["是否公开", "公开"],
  submitted_at: ["提交答卷时间"],
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
  const articleBody = value(row, questionnaireFieldMap.article_content);
  const message = value(row, questionnaireFieldMap.message);
  const retrospective = value(row, questionnaireFieldMap.retrospective);
  const contact = value(row, questionnaireFieldMap.contact);
  const articleContent = [
    articleBody,
    message && `最想告诉学弟学妹：${message}`,
    retrospective && `如果重新回到高三：${retrospective}`,
    isPublicContact(value(row, questionnaireFieldMap.contact_public)) && contact && `联系方式：${contact}`,
  ].filter(Boolean).join("\n\n");
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
      education_level: stripChoice(value(row, questionnaireFieldMap.education_level)),
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
      show_score: value(row, questionnaireFieldMap.show_fields).includes("高考总分"),
      show_rank: value(row, questionnaireFieldMap.show_fields).includes("全省排名"),
      contact: isPublicContact(value(row, questionnaireFieldMap.contact_public)) ? contact : "",
      show_contact: isPublicContact(value(row, questionnaireFieldMap.contact_public)),
      published: true,
    },
    article: articleTitle && articleContent ? {
      title: articleTitle,
      category: stripChoice(value(row, questionnaireFieldMap.article_category)) || "大学生活",
      summary: summary || generateSummary(articleContent),
      content: articleContent,
      published: booleanValue(value(row, questionnaireFieldMap.article_public), true),
      created_at: questionnaireDate(value(row, questionnaireFieldMap.submitted_at)),
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
    const normalizedAlias = normalizeHeader(alias);
    for (const [key, found] of Object.entries(row)) {
      if (normalizeHeader(key).includes(normalizedAlias) && found !== undefined && found !== null && String(found).trim()) {
        return String(found).trim();
      }
    }
  }
  return "";
}

function normalizeHeader(input: string) {
  return input.replace(/^\s*\d+\.\s*/, "").replace(/[\s*（）()：:？?]/g, "").trim();
}

function stripChoice(input: string) {
  return input.replace(/^[A-Z]\.\s*/, "").trim();
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

function isPublicContact(input: string) {
  return input.includes("允许公开");
}

function questionnaireDate(input: string) {
  const match = input.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})/);
  if (!match) return undefined;
  const [, month, day, year, hour, minute] = match;
  return new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:00+08:00`).toISOString();
}
