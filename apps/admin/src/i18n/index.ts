import { createI18n } from 'vue-i18n'
import zh from '@/locales/zh.json'
import en from '@/locales/en.json'

// 获取浏览器默认语言并映射到项目支持的语言
function getBrowserLang() {
  const lang = window.navigator.language || (window.navigator as any).userLanguage
  if (lang.startsWith('zh')) return 'zh'
  return 'en'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API
  globalInjection: true, // 全局注入 $t 等函数
  allowComposition: true, // 允许在 Composition API 中使用
  locale: localStorage.getItem('lang') || getBrowserLang(),
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n
