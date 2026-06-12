# 枣子坡校友说 v1.1

枣子坡校友说是溆浦一中非官方校友经验分享平台。网站以“问卷星收集 + 管理员审核导入”的方式整理真实校友经验，普通访客无需注册即可浏览。

## 技术栈

- Next.js 16
- React 19
- Supabase 数据库
- EdgeOne Pages
- `read-excel-file` 浏览器端 Excel 解析，CSV 使用内置解析器

项目不使用 Supabase Auth、SSR Cookies、Middleware 或 Proxy。

## 页面

- `/` 首页、动态统计、问卷二维码入口
- `/articles`、`/articles/[id]` 经验文章
- `/alumni`、`/alumni/[id]` 枣友名片
- `/admin` 内容统计、系统状态、导入记录和内容管理
- `/admin/import` 问卷星 Excel / CSV 导入

Supabase 不可用时，公开页面自动使用 `lib/mock-data.ts`，保证网站仍可浏览。

## 环境变量

在 EdgeOne Pages 和本地 `.env.local` 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_IMPORT_SECRET=zaozipo-admin-2026-Jalex-XuPu
EDGEONE_VERSION=v1.1
```

`SUPABASE_SERVICE_ROLE_KEY` 与 `ADMIN_IMPORT_SECRET` 只能作为服务端环境变量，不能添加 `NEXT_PUBLIC_` 前缀。

## 数据库初始化

1. 打开 Supabase SQL Editor。
2. 执行 `supabase/questionnaire-library-final.sql`。
3. 确认创建 `alumni_profiles`、`articles`、`imports` 三张表。
4. 在 EdgeOne Pages 配置上述环境变量并重新部署。

`questionnaire-library-final.sql` 会重建 `public` schema，正式执行前请备份已有数据。

已有数据库只需执行 `supabase/add-public-contact-fields.sql`，即可增加按问卷授权展示的公开联系方式字段。

## 更换问卷二维码

替换：

```text
public/questionnaire-placeholder.png
```

无需修改代码。若文件不存在或加载失败，弹窗会显示“问卷暂未开放，请联系管理员。”

## 导入问卷数据

实际操作流程：

```text
问卷星导出 Excel / CSV
↓
打开 /admin/import
↓
输入管理员密钥与操作人名称
↓
点击或拖拽上传文件
↓
预览新增、重复与缺失行
↓
确认导入并更新网站
↓
刷新首页、枣友页、文章页查看最新数据
```

重复规则为：`姓名 + 毕业年份 + 当前大学 / 机构`。重复与缺少关键信息的行默认跳过。

若文章摘要为空，系统会清理正文换行和多余空格，并使用正文前 100 字自动生成摘要。

### 直接导入问卷星 Word 结果

问卷星单份答卷导出的 `.docx` 可以通过命令直接解析并上传：

```bash
npm run import:docx -- "C:\Users\你的用户名\Downloads\问卷结果.docx"
```

命令会显示即将上传的枣友与文章信息，然后提示输入管理员密钥。上传成功后，网站首页、枣友页和文章页会自动更新；若该枣友已经存在，则自动跳过。

仅检查解析结果、不上传：

```bash
npm run import:docx -- "C:\路径\问卷结果.docx" --dry-run
```

默认上传到正式站点。也可以使用 `IMPORT_BASE_URL`、`ADMIN_IMPORT_SECRET` 和 `IMPORT_OPERATOR` 环境变量覆盖站点、密钥和操作人。

## 导入安全

- 浏览器仅解析 Excel 和展示预览。
- `/api/admin/import` 校验 `ADMIN_IMPORT_SECRET`。
- Supabase service role key 仅在服务端 API 使用。
- 匿名用户只能读取 `published = true` 的枣友和文章。

## 本地运行

```bash
npm install
npm run dev
```

正式上线检查：

```bash
npm run lint
npm run build
```

## EdgeOne Pages 部署

1. 将项目推送到代码仓库。
2. 在 EdgeOne Pages 连接仓库。
3. 构建命令使用 `npm run build`。
4. 配置全部环境变量。
5. 部署后访问 `/admin/import` 完成一次测试导入。
6. 检查 `/`、`/alumni`、`/articles` 是否出现新数据。
