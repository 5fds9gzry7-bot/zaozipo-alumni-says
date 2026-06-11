export type ProfileRole = "user" | "alumni" | "admin" | "super_admin";
export type ProfileStatus = "active" | "banned";
export type ContentStatus = "published" | "hidden" | "deleted";
export type ReportStatus = "pending" | "resolved" | "rejected";
export type ReportTargetType = "article" | "alumni_profile" | "user";

export type Profile = {
  id: string; email: string | null; display_name: string | null; avatar_url: string | null;
  role: ProfileRole; status: ProfileStatus; created_at: string; updated_at: string;
};

export type AlumniProfile = {
  id: string; user_id: string; display_name: string; graduation_year: number; class_name: string | null;
  university: string; college: string | null; major: string; city: string; country: string; stage: string;
  direction: string | null; tags: string[]; intro: string; gaokao_year: number | null;
  gaokao_province: string | null; gaokao_type: string | null; gaokao_score: number | null;
  gaokao_rank: number | null; show_score: boolean; show_rank: boolean; admitted_university: string | null;
  admitted_major: string | null; study_advice: string | null; exam_advice: string | null;
  application_advice: string | null; major_advice: string | null; message_to_students: string | null;
  contact: string | null; show_contact: boolean; status: ContentStatus; created_at: string;
  updated_at: string; deleted_at: string | null;
};

export type ArticleRecord = {
  id: string; author_id: string; alumni_profile_id: string | null; title: string; excerpt: string;
  content: string; category: string; tags: string[]; status: ContentStatus; like_count: number;
  favorite_count: number; view_count: number; read_time: string; published_at: string;
  created_at: string; updated_at: string; deleted_at: string | null;
};

export type Report = {
  id: string; reporter_id: string; target_type: ReportTargetType; target_id: string; reason: string;
  detail: string | null; status: ReportStatus; handled_by: string | null; handled_at: string | null; created_at: string;
};

export type AdminAction = {
  id: string; admin_id: string; action_type: string; target_type: string; target_id: string;
  note: string | null; created_at: string;
};

export type ActionResult = { ok: boolean; message: string };
export type AdminDashboardData = {
  profile: Profile | null; reports: Report[]; alumni: AlumniProfile[];
  articles: ArticleRecord[]; users: Profile[]; recentActions: AdminAction[];
};
export type DebugData = {
  configured: boolean; userEmail: string | null; profile: Profile | null; alumniCount: number | null;
  articleCount: number | null; errors: string[];
};
