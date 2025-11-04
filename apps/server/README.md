# Koa2 + PostgreSQL + Prisma Backend

- Stack: Koa2, @koa/router, @koa/cors, PostgreSQL, Prisma, TypeScript
- Auth: JWT（登录）、BCrypt（密码散列）

## 快速开始
1. 复制 `.env.example` 为 `.env` 并修改配置：
   - `DATABASE_URL=postgresql://<user>:<pass>@localhost:5432/<db>?schema=public`
   - `JWT_SECRET=your-strong-secret`
   - `PORT=3000`
   - `DATA_SOURCE=postgres | file`
   - 当 `DATA_SOURCE=file` 时可选：`DATA_FILE_PATH=<绝对或相对路径>`（默认 `apps/server/data/db.json`）
2. 安装依赖（建议使用 pnpm；如未安装可暂用 npm）：
   - `pnpm i` 或 `npm i`
3. 生成 Prisma Client：
   - `pnpm prisma:generate` 或 `npm run prisma:generate`
4. 如果 `DATA_SOURCE=postgres`，初始化数据库（本地 PostgreSQL 必须可用）：
   - `pnpm prisma:migrate` 或 `npm run prisma:migrate`
5. 启动开发服务器：
   - `pnpm dev` 或 `npm run dev`

## 接口
- `POST /api/auth/register`：注册（body: `{ username, password, name? }`）
- `POST /api/auth/login`：登录（body: `{ username, password }`），返回 `{ token, user }`
- `GET /api/me`：携带 `Authorization: Bearer <token>`，返回当前用户信息
- `GET /api/health`：健康检查

## ORM 推荐
- Prisma（PostgreSQL 模式）：类型安全、开发体验好、迁移/生成工具完善。
- 备选：TypeORM（成熟，装饰器风格）、Drizzle（轻量，Schema as Code）。

## 可插拔数据源说明
- 通过 `DATA_SOURCE` 环境变量选择：`postgres` 使用 Prisma + PostgreSQL；`file` 使用本地 JSON 文件。
- 两种实现共享统一仓库接口（`UserRepo`），路由逻辑不需要修改即可切换数据源。

## 注意
- 首次安装需 `prisma generate`，否则运行时无法实例化 Client。
- 跨域已默认开启（`@koa/cors`），允许前端在 `localhost:5173` 调用。