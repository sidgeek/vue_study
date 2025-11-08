# PostgreSQL 在 Docker 环境下的常用使用手册

适用于当前项目的 Compose 环境（容器名 `postgres-db`，数据库 `appdb`，用户 `postgres`，密码 `postgres`，端口 `5432`）。

## 启动与健康检查
- 启动数据库容器：`docker compose up -d postgres`
- 查看容器状态：`docker ps`
- 查看日志：`docker logs -n 200 postgres-db`
- 等待健康检查：`docker inspect -f '{{.State.Health.Status}}' postgres-db`

## 进入容器与连接数据库
- 进入容器交互终端：`docker exec -it postgres-db sh`（或 `bash`，视镜像是否提供）
- 容器内连接：`psql -U postgres -d appdb`
- 宿主机连接（端口映射为 `localhost:5432`）：
  - `psql -h localhost -U postgres -d appdb`
  - 一次性免交互密码：`PGPASSWORD=postgres psql -h localhost -U postgres -d appdb -c '\\conninfo'`
- URI 连接串（CLI/GUI 通用）：`postgresql://postgres:postgres@localhost:5432/appdb`

## 初始化与执行 SQL 文件
- 执行单条 SQL：`psql -h localhost -U postgres -d appdb -c 'SELECT 1;'`
- 执行 `.sql` 文件：`psql -h localhost -U postgres -d appdb -f path/to/file.sql`
- 创建数据库（示例，当前已存在 `appdb` 可略过）：`CREATE DATABASE appdb;`
- 创建模式（schema）：`CREATE SCHEMA IF NOT EXISTS public;`


## 查看结构与元信息（psql 交互模式）
- 列出所有表：`\dt`
- 查看表结构：`\d "User"`
- 当前连接信息：`\conninfo`
- 退出 `psql`：`\q`

## 清空与重置
- 清空两表并重置自增：
```sh
psql -h localhost -U postgres -d appdb <<'SQL'
TRUNCATE TABLE "User", "Role" RESTART IDENTITY CASCADE;
SQL
```
- 删除表：
```sh
psql -h localhost -U postgres -d appdb <<'SQL'
DROP TABLE IF EXISTS "User";
SQL
psql -h localhost -U postgres -d appdb <<'SQL'
DROP TABLE IF EXISTS "Role";
SQL
```
- 彻底清库（删除数据卷，不可恢复）：
```sh
docker compose down -v
docker compose up -d postgres
```

## 便捷别名（~/.zshrc）
在你的 `~/.zshrc` 添加：
```sh
alias psqlc='docker exec -it postgres-db psql -U postgres -d appdb'
```
生效别名：`source ~/.zshrc`，使用：`psqlc`

## 故障排查
- 端口占用：确认 `5432` 未被占用；如占用，结束对应进程后重试。
- 连接失败：核对 `HOST=localhost`、`USER=postgres`、`PASSWORD=postgres`、`DB=appdb`。
- 缺表报错（P2021）：表示表不存在；按“创建表结构示例”执行建表或应用迁移。
- 大写/驼峰表名需加双引号，否则会被转为小写（`User` -> `user`）。

## 结合当前后端的提示
- 如果你希望“从头启动且不执行迁移”，容器已默认设置 `AUTO_MIGRATE=false`，后端会正常启动但数据库表不存在，涉及数据库的接口会失败，这是预期行为。
- 要快速创建表但不生成迁移历史（开发便利）：在宿主机执行 `pnpm --filter apps/server prisma db push`。
- 标准做法（生产/持续集成）：使用迁移：`pnpm --filter apps/server prisma migrate deploy` 或在容器启动时开启 `AUTO_MIGRATE=true`。


```sh
psql -h localhost -U postgres -d appdb <<'SQL'
SELECT crypt('123456', "passwordHash") = "passwordHash" AS ok FROM "User" WHERE username='user01';
SQL