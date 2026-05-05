# Furniture Brand Reviews

Furniture Brand Reviews 是一个面向全球家具品牌的评论平台 MVP，使用 Next.js App Router、TypeScript、Tailwind CSS、Supabase 和 Vercel。

## 功能

- 首页品牌搜索、热门品牌、最新评论、评分最高品牌和品牌认领入口
- 品牌列表页：`/brands`
- 品牌详情页：`/review/[slug]`
- 写评论页：`/review/[slug]/write`
- 后台审核页：`/admin/reviews`
- 静态页面：关于、联系、评论指南、隐私政策、条款、举报评论
- 新评论默认写入 `reviews.status = 'pending'`
- 前台只展示 `status = 'approved'` 的评论
- 后台可以查看 pending 评论，并执行 Approve / Reject / Mark as verified
- `sitemap.xml` 和 `robots.txt` 已配置

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 创建本地环境变量文件：

```bash
cp .env.local.example .env.local
```

3. 在 `.env.local` 填入 Supabase 和后台密码：

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

说明：
- `NEXT_PUBLIC_SUPABASE_URL` 必须是项目根 URL，不要包含 `/rest/v1`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 可以使用 Supabase 的 anon key 或新版 `sb_publishable_` key
- `SUPABASE_SERVICE_ROLE_KEY` 只在服务端使用，建议生产环境配置；MVP 也支持 anon fallback，但更安全的方案是配置 service role
- `.env.local` 已在 `.gitignore` 中，不要提交到 GitHub

4. 在 Supabase SQL Editor 运行：

```sql
-- 复制并运行 supabase/schema.sql 的全部内容
```

如果你的 `companies` 表已经存在，请至少运行这段 SQL，为品牌 logo 预留字段：

```sql
alter table companies add column if not exists logo_url text;
```

5. 如果需要上传 proof image，在 Supabase Storage 创建公开 bucket：

```text
review-proof
```

6. 启动开发服务器：

```bash
npm run dev
```

打开 `http://localhost:3000`。

## 评论审核流程

用户在 `/review/[slug]/write` 提交评论后，会写入 `reviews` 表：

```sql
status = 'pending'
is_verified = false
```

前台品牌详情页只查询：

```sql
status = 'approved'
```

因此：
- `approved` 评论会在前台显示
- `pending` 评论不会在前台显示
- `rejected` 评论不会在前台显示

后台审核：

```text
/admin/reviews?password=你的 ADMIN_PASSWORD
```

后台显示字段：
- brand/company name
- rating
- title
- email
- created_at

## 上线前清理测试评论

本地代码里的 sample review 已清空，真实 companies 数据保留。

如果 Supabase 里有测试评论，请在 Supabase SQL Editor 按你的测试数据特征删除。示例：

```sql
delete from reviews
where reviewer_email in ('test@example.com', 'hannah@example.com', 'james@example.com')
   or title ilike '%test%'
   or content ilike '%test review%';
```

如果你只想清空所有非 approved 评论：

```sql
delete from reviews
where status in ('pending', 'rejected');
```

运行删除 SQL 前请先确认没有真实用户评论匹配条件。

## Vercel 部署

1. 将代码推送到 GitHub，但不要提交 `.env.local`
2. 在 Vercel 创建项目并连接 GitHub 仓库
3. 在 Vercel Project Settings > Environment Variables 添加：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-or-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=your-admin-password
```

4. 部署后检查：

```text
/
/brands
/review/oak-and-nest
/review/oak-and-nest/write
/admin/reviews?password=你的 ADMIN_PASSWORD
/sitemap.xml
```

## 常用命令

```bash
npm run dev
npm run build
npm run start
```
