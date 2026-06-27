# saas-aam-web-hrs

HRS 前端项目，基于 Vue 3 + TypeScript + Vite。

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

## 环境变量

`.env` 中配置 `SYS_CODE`，用于部署子路径（默认 `hrs`）。
