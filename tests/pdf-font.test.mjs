import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  PDF_CHINESE_FONT_FILE,
  PDF_CHINESE_FONT_NAME,
  arrayBufferToBase64,
  registerPdfChineseFont,
} from '../lib/pdf-font.js'

test('arrayBufferToBase64 converts binary font bytes without data loss', () => {
  const buffer = new Uint8Array([0, 1, 2, 255]).buffer

  assert.equal(arrayBufferToBase64(buffer), 'AAEC/w==')
})

test('registerPdfChineseFont embeds and activates the Chinese PDF font', async () => {
  const calls = []
  const doc = {
    addFileToVFS(fileName, fontData) {
      calls.push(['addFileToVFS', fileName, fontData])
    },
    addFont(fileName, fontName, fontStyle) {
      calls.push(['addFont', fileName, fontName, fontStyle])
    },
    setFont(fontName, fontStyle) {
      calls.push(['setFont', fontName, fontStyle])
    },
  }

  const fontName = await registerPdfChineseFont(doc, {
    cache: false,
    fetcher: async () => ({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    }),
  })

  assert.equal(fontName, PDF_CHINESE_FONT_NAME)
  assert.deepEqual(calls, [
    ['addFileToVFS', PDF_CHINESE_FONT_FILE, 'AQID'],
    ['addFont', PDF_CHINESE_FONT_FILE, PDF_CHINESE_FONT_NAME, 'normal'],
    ['addFont', PDF_CHINESE_FONT_FILE, PDF_CHINESE_FONT_NAME, 'bold'],
    ['setFont', PDF_CHINESE_FONT_NAME, 'normal'],
  ])
})
