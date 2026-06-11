# Supabase 数据库

当前项目不使用 Supabase Auth。

正式上线请在 Supabase SQL Editor 执行 `questionnaire-library-final.sql`。该脚本会重建 `public` schema，并创建：

- `alumni_profiles`
- `articles`
- `imports`
- 公开只读 RLS

管理员导入通过 Next.js 服务端 API 与 `SUPABASE_SERVICE_ROLE_KEY` 完成，不向浏览器暴露写权限。
