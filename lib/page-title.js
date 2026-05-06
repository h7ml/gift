export const APP_TITLE = '中国礼薄'

export function buildPageTitle(title) {
  const normalizedTitle = typeof title === 'string' ? title.trim() : ''

  if (!normalizedTitle || normalizedTitle === APP_TITLE) {
    return APP_TITLE
  }

  return `${normalizedTitle} - ${APP_TITLE}`
}
