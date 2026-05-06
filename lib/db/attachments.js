import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { query } from './client.js'

export const ATTACHMENT_UPLOAD_DIR = path.join(
  process.cwd(),
  'uploads',
  'event-attachments'
)

export function mapAttachmentRow(row) {
  return {
    id: row.id,
    eventId: row.event_id,
    originalName: row.original_name,
    displayName: row.display_name ?? undefined,
    note: row.note ?? undefined,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    url: `/api/attachments/${row.id}/file`,
    createdAt: toIsoString(row.created_at),
  }
}

export function sanitizeAttachmentFileName(fileName) {
  const parsed = path.parse(path.basename(fileName))
  const baseName = toAsciiSlug(parsed.name)
  const extension = parsed.ext.toLowerCase().replace(/[^a-z0-9.]/g, '')
  const safeName = baseName || 'attachment'

  return `${safeName}${extension}`
}

export function buildStoredAttachmentName({ attachmentId, originalName }) {
  return `${attachmentId}-${sanitizeAttachmentFileName(originalName)}`
}

function toAsciiSlug(value) {
  const transliterated = value
    .replace(/手/g, ' shou ')
    .replace(/记/g, ' ji ')
    .replace(/原/g, ' yuan ')
    .replace(/图/g, ' tu ')
  const slug = transliterated
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return slug.slice(0, 80)
}

function toIsoString(value) {
  return value instanceof Date ? value.toISOString() : value
}

export async function listAttachments(userId, eventId) {
  const result = await query(
    `select event_attachments.id,
            event_attachments.event_id,
            event_attachments.original_name,
            event_attachments.stored_name,
            event_attachments.display_name,
            event_attachments.note,
            event_attachments.mime_type,
            event_attachments.size_bytes,
            event_attachments.created_at
     from event_attachments
     inner join events on events.id = event_attachments.event_id
     where event_attachments.event_id = $1 and events.user_id = $2
     order by event_attachments.created_at desc`,
    [eventId, userId]
  )

  return result.rows.map(mapAttachmentRow)
}

export async function createAttachment(userId, eventId, file) {
  const eventResult = await query(
    'select id from events where id = $1 and user_id = $2',
    [eventId, userId]
  )

  if (eventResult.rowCount === 0) {
    return null
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const insertResult = await query(
    `insert into event_attachments (event_id, original_name, stored_name, display_name, mime_type, size_bytes)
     values ($1, $2, '', $2, $3, $4)
     returning id, event_id, original_name, stored_name, display_name, note, mime_type, size_bytes, created_at`,
    [eventId, file.name, file.type || 'application/octet-stream', buffer.length]
  )
  const row = insertResult.rows[0]
  const storedName = buildStoredAttachmentName({
    attachmentId: row.id,
    originalName: file.name,
  })

  await mkdir(ATTACHMENT_UPLOAD_DIR, { recursive: true })
  await writeFile(path.join(ATTACHMENT_UPLOAD_DIR, storedName), buffer)

  const updateResult = await query(
    `update event_attachments
     set stored_name = $2
     where id = $1
     returning id, event_id, original_name, stored_name, display_name, note, mime_type, size_bytes, created_at`,
    [row.id, storedName]
  )

  return mapAttachmentRow(updateResult.rows[0])
}

export async function findAttachmentForUser(userId, attachmentId) {
  const result = await query(
    `select event_attachments.id,
            event_attachments.event_id,
            event_attachments.original_name,
            event_attachments.stored_name,
            event_attachments.display_name,
            event_attachments.note,
            event_attachments.mime_type,
            event_attachments.size_bytes,
            event_attachments.created_at
     from event_attachments
     inner join events on events.id = event_attachments.event_id
     where event_attachments.id = $1 and events.user_id = $2`,
    [attachmentId, userId]
  )

  return result.rows[0] ?? null
}

export async function updateAttachment(userId, attachmentId, updates) {
  const result = await query(
    `update event_attachments
     set display_name = $3,
         note = $4
     from events
     where event_attachments.id = $1
       and event_attachments.event_id = events.id
       and events.user_id = $2
     returning event_attachments.id,
               event_attachments.event_id,
               event_attachments.original_name,
               event_attachments.stored_name,
               event_attachments.display_name,
               event_attachments.note,
               event_attachments.mime_type,
               event_attachments.size_bytes,
               event_attachments.created_at`,
    [
      attachmentId,
      userId,
      normalizeNullableString(updates.displayName),
      normalizeNullableString(updates.note),
    ]
  )

  return result.rows[0] ? mapAttachmentRow(result.rows[0]) : null
}

function normalizeNullableString(value) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

export async function deleteAttachment(userId, attachmentId) {
  const attachment = await findAttachmentForUser(userId, attachmentId)

  if (!attachment) {
    return false
  }

  await query('delete from event_attachments where id = $1', [attachmentId])
  await unlink(path.join(ATTACHMENT_UPLOAD_DIR, attachment.stored_name)).catch(
    () => undefined
  )

  return true
}
