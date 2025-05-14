# Amazon Monorepo

一个使用Monorepo结构的全栈项目。

## 技术栈

- **环境**: Nodejs22
- **语言**: TypeScript
- **前端**: Vue 3 + Vite + naive-ui
- **后端**: NestJS
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **包管理器**: pnpm workspaces

## 项目结构

```
amazon-monorepo/
├── apps/                 # 应用目录
│   ├── frontend/         # 前端应用 (Vite + Vue + TypeScript)
│   └── backend/          # 后端应用 (NestJS + TypeScript)
├── packages/             # 共享包目录
│   └── shared/           # 前后端共享的代码
├── package.json          # 根目录包配置
├── pnpm-workspace.yaml   # pnpm工作区配置
```
