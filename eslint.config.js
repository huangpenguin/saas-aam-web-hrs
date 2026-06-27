import vuePlugin from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import vueParser from 'vue-eslint-parser' // 显式引入 Vue 解析器

export default [
  // 全局忽略目录
  {
    ignores: ['node_modules', 'dist', '.git', '*.log', 'public'],
  },

  // Vue 和 TypeScript 配置（适用于 .ts, .tsx, .js 文件）
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // 基础规则
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      // TypeScript 推荐规则
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
  },

  // 针对 .vue 文件，使用 vue-eslint-parser 解析
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser, // 使用 vue-eslint-parser 解析 .vue 文件
      parserOptions: {
        parser: tsParser, // 解析 <script> 部分时使用 TypeScript 解析器
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      vue: vuePlugin,
      '@typescript-eslint': tsPlugin, // 允许在 .vue 文件中使用 TypeScript 规则
    },
    rules: {
      // 继承 Vue 插件的推荐规则（扁平化格式）
      ...(vuePlugin.configs['flat/base']?.rules || {}),
      ...(vuePlugin.configs['flat/essential']?.rules || {}),
      // 可在此覆盖或添加自定义规则
    },
  },
]
