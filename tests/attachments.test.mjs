import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildAttachmentDownloadHeaders,
  buildStoredAttachmentName,
  mapAttachmentRow,
  sanitizeAttachmentFileName,
} from '../lib/db/attachments.js'

test('sanitizeAttachmentFileName removes path segments and unsafe characters', () => {
  assert.equal(
    sanitizeAttachmentFileName('../手记 01(原图).jpg'),
    'shou-ji-01-yuan-tu.jpg'
  )
  assert.equal(sanitizeAttachmentFileName('   '), 'attachment')
})

test('buildStoredAttachmentName keeps extension and prefixes stable identifiers', () => {
  const storedName = buildStoredAttachmentName({
    attachmentId: 'abc-123',
    originalName: '手记 01.jpg',
  })

  assert.equal(storedName, 'abc-123-shou-ji-01.jpg')
})

test('mapAttachmentRow returns the client attachment shape', () => {
  const attachment = mapAttachmentRow({
    id: 'attachment-1',
    event_id: 'event-1',
    original_name: '手记.jpg',
    stored_name: 'attachment-1-shou-ji.jpg',
    display_name: '婚礼手记',
    note: '第一页',
    mime_type: 'image/jpeg',
    size_bytes: '1200',
    created_at: '2026-05-07T10:00:00.000Z',
  })

  assert.deepEqual(attachment, {
    id: 'attachment-1',
    eventId: 'event-1',
    originalName: '手记.jpg',
    displayName: '婚礼手记',
    note: '第一页',
    mimeType: 'image/jpeg',
    sizeBytes: 1200,
    url: '/api/attachments/attachment-1/file',
    createdAt: '2026-05-07T10:00:00.000Z',
  })
})

test('mapAttachmentRow falls back to originalName when displayName is empty', () => {
  const attachment = mapAttachmentRow({
    id: 'attachment-2',
    event_id: 'event-1',
    original_name: '原始文件.pdf',
    stored_name: 'attachment-2.pdf',
    display_name: null,
    note: null,
    mime_type: 'application/pdf',
    size_bytes: 42,
    created_at: '2026-05-07T10:00:00.000Z',
  })

  assert.equal(attachment.displayName, undefined)
  assert.equal(attachment.note, undefined)
})

test('buildAttachmentDownloadHeaders uses the uploaded file name for downloads', () => {
  const headers = buildAttachmentDownloadHeaders({
    original_name: '手记 01.jpg',
    display_name: null,
    mime_type: 'image/jpeg',
  })

  assert.equal(headers['Content-Type'], 'image/jpeg')
  assert.equal(
    headers['Content-Disposition'],
    `inline; filename="shou-ji-01.jpg"; filename*=UTF-8''%E6%89%8B%E8%AE%B0%2001.jpg`
  )
})

test('buildAttachmentDownloadHeaders prefers edited display name', () => {
  const headers = buildAttachmentDownloadHeaders({
    original_name: '1.jpg',
    display_name: '婚礼手记.jpg',
    mime_type: 'image/jpeg',
  })

  assert.equal(
    headers['Content-Disposition'],
    `inline; filename="shou-ji.jpg"; filename*=UTF-8''%E5%A9%9A%E7%A4%BC%E6%89%8B%E8%AE%B0.jpg`
  )
})
