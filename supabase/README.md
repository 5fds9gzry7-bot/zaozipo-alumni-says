# Supabase 无审核版本配置

1. 在 Supabase SQL Editor 完整执行 `no-review-reset.sql`。它会删除并重建 `public` schema。
2. 在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_SUPABASE_URL=你的项目 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的 anon public key
```

3. 重启开发服务器，访问 `/auth` 注册。注册用户默认是 `alumni / active`，并自动创建公开枣友名片。
4. 如果 Supabase Auth 开启了 Confirm email，先打开验证邮件再登录；想立即登录可在 Auth 设置中关闭邮箱确认。
5. 注册管理员邮箱后，在 SQL Editor 执行：

```sql
update public.profiles
set role = 'super_admin', status = 'active'
where email = 'jalex1049329707@gmail.com';
```

6. `/debug` 可查看环境变量、当前会话、profile、表数量和最近查询错误。

当前版本没有枣友或文章审核。名片保存与文章投稿均直接公开；管理员仅处理举报、隐藏内容和封禁用户。
