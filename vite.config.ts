import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig(({ mode }) => {
  // 加载所有环境变量，第三个参数 '' 表示不过滤前缀
  const env = loadEnv(mode, process.cwd(), '')
  const sysCode = env.VITE_SYS_CODE || 'hrs'

  return {
    plugins: [vue()],
    base: `/${sysCode}/`,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      open: '/hrs/',
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**', '**/.pnpm-store/**'],
      },
    },
  }
})
