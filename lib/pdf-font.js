export const PDF_CHINESE_FONT_NAME = 'LXGWNeoXiHei'
export const PDF_CHINESE_FONT_FILE = 'LXGWNeoXiHei.ttf'
export const PDF_CHINESE_FONT_URL = `/fonts/${PDF_CHINESE_FONT_FILE}`

let cachedFontData = null

export function arrayBufferToBase64(buffer) {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(buffer).toString('base64')
  }

  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

async function loadPdfFontData({
  cache = true,
  fetcher = globalThis.fetch,
  fontUrl = PDF_CHINESE_FONT_URL,
} = {}) {
  if (cache && cachedFontData) {
    return cachedFontData
  }

  if (typeof fetcher !== 'function') {
    throw new Error('当前环境不支持加载 PDF 中文字体')
  }

  const response = await fetcher(fontUrl)
  if (!response.ok) {
    throw new Error(`PDF 中文字体加载失败: ${response.status}`)
  }

  const fontData = arrayBufferToBase64(await response.arrayBuffer())
  if (cache) {
    cachedFontData = fontData
  }

  return fontData
}

export async function registerPdfChineseFont(doc, options = {}) {
  const fontData = await loadPdfFontData(options)

  doc.addFileToVFS(PDF_CHINESE_FONT_FILE, fontData)
  doc.addFont(PDF_CHINESE_FONT_FILE, PDF_CHINESE_FONT_NAME, 'normal')
  doc.addFont(PDF_CHINESE_FONT_FILE, PDF_CHINESE_FONT_NAME, 'bold')
  doc.setFont(PDF_CHINESE_FONT_NAME, 'normal')

  return PDF_CHINESE_FONT_NAME
}
