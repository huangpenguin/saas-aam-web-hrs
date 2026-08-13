# saas-aam-web-hrs

HRS 前端项目，基于 Vue 3 + TypeScript + Vite。

API 评审入口：[HRS API 设计](./docs/api/hrs-api-design.md)；可导入 Apifox 的契约位于 `docs/api/openapi/hrs-v1.yaml`。

## 开发

```bash
pnpm install
cp .env.example .env   # 首次需要
pnpm dev
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 类型检查并构建 |
| `pnpm preview` | 预览构建产物 |
| `pnpm check` | 格式化 + ESLint 修复 |
| `pnpm test` | 单元测试与 API 契约守护测试 |

## 环境变量

`.env` 中配置 `SYS_CODE`，用于部署子路径（默认 `hrs`）。
