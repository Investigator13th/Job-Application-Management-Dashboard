# 求职申请管理看板

一个基于 React + TypeScript + Vite + Supabase 的求职申请管理看板。

## 项目概览

当前 P0 版本聚焦一条最小可用闭环：
- 邮箱注册 / 登录
- 申请卡片创建、编辑、删除
- 按阶段展示 Kanban 看板
- 拖拽卡片跨列更新阶段
- DDL 展示与临近提示

## 技术栈

- React 18
- TypeScript
- Vite
- React Router
- Supabase Auth / Database
- dnd-kit

## 启动项目

先确保 `.env` 中已配置：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

然后使用 pnpm：

```bash
pnpm install
pnpm dev
```

默认会启动本地 Vite 开发服务器。

## 常用命令

### 启动开发环境

```bash
pnpm dev
```

### 生产构建

```bash
pnpm build
```

### 本地预览构建结果

```bash
pnpm preview
```

## 代码结构

- `src/app`：应用入口、Router 装配
- `src/pages`：页面级组件，当前包含认证页和看板页
- `src/components`：可复用 UI 组件，如看板列、申请卡片、DDL 面板、路由保护
- `src/hooks`：认证上下文与 `useAuth`
- `src/lib`：Supabase client、application 数据访问、deadline 计算、按阶段分组逻辑
- `src/constants`：阶段、路由、表名等共享常量
- `src/types`：核心业务类型定义
- `src/styles`：全局样式与设计 token
- `docs`：产品与执行文档

## 关键架构说明

### 认证流

应用最外层由 `AuthProvider` 提供会话状态，`ProtectedRoute` 负责拦截未登录访问首页的请求。`/auth` 为认证页，`/` 为业务看板页。

### 数据流

`BoardPage` 是当前核心业务容器：
- 进入页面后调用统一数据层加载 `applications`
- 通过按阶段分组逻辑驱动 Kanban 渲染
- 新增、编辑、删除、拖拽都通过 `src/lib/applications.ts` 中统一封装的方法访问 Supabase

### 拖拽流

拖拽基于 dnd-kit：
- 列作为 droppable
- 卡片作为 sortable item
- 拖拽结束后只更新 `stage`
- 先乐观更新本地状态，再持久化到 Supabase，失败时回滚

### DDL 展示

DDL 状态由 `src/lib/deadlines.ts` 统一计算：
- 已过期
- 未来 3 天内临近截止
- 普通
- 未设置

卡片展示单条 deadline 状态，`DeadlinePanel` 聚合首页最紧急事项。
