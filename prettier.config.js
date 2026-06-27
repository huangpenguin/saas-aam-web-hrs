/** @type {import("prettier").Config} */
export default {
  // 每行最大字符数
  printWidth: 100,
  // 使用单引号
  singleQuote: true,
  // 不使用分号结尾
  semi: false,
  // 尾随逗号（ES5 支持的地方加）
  trailingComma: 'es5',
  // 缩进大小
  tabWidth: 2,
  // 使用空格缩进
  useTabs: false,
  // 箭头函数参数只有一个时也包裹括号
  arrowParens: 'always',
  // 换行符
  endOfLine: 'lf',
}
