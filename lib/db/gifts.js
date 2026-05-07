import { query, withTransaction } from './client.js'
import { mapAttachmentRow } from './attachments.js'
import { normalizeGiftRecordName } from '../excel-import.js'

export function mapEventRow(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    date: toDateString(row.event_date),
    bookkeeperName: row.bookkeeper_name ?? '',
    location: row.location ?? undefined,
    description: row.description ?? undefined,
    createdAt: toIsoString(row.created_at),
  }
}

export function mapGiftRecordRow(row) {
  return {
    id: row.id,
    guestName: row.guest_name,
    amount: Number(row.amount),
    giftItem: row.gift_item ?? '',
    relativeTitle: row.relative_title ?? undefined,
    phoneNumber: row.phone_number ?? undefined,
    homeAddress: row.home_address ?? undefined,
    date: toDateString(row.record_date),
    eventId: row.event_id,
    note: row.note ?? undefined,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at ?? row.created_at),
  }
}

function toDateString(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  return String(value).slice(0, 10)
}

function toIsoString(value) {
  return value instanceof Date ? value.toISOString() : value
}

export async function listGiftBookData(userId) {
  const [eventsResult, recordsResult, attachmentsResult] = await Promise.all([
    query(
      `select id, name, type, event_date, bookkeeper_name, location, description, created_at
       from events
       where user_id = $1
       order by created_at desc`,
      [userId]
    ),
    query(
      `select gift_records.id,
              gift_records.guest_name,
              gift_records.amount,
              gift_records.gift_item,
              gift_records.relative_title,
              gift_records.phone_number,
              gift_records.home_address,
              gift_records.record_date,
              gift_records.event_id,
              gift_records.note,
              gift_records.updated_at,
              gift_records.created_at
       from gift_records
       inner join events on events.id = gift_records.event_id
       where events.user_id = $1
       order by gift_records.created_at desc`,
      [userId]
    ),
    query(
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
       where events.user_id = $1
       order by event_attachments.created_at desc`,
      [userId]
    ),
  ])

  return {
    events: eventsResult.rows.map(mapEventRow),
    records: recordsResult.rows.map(mapGiftRecordRow),
    attachments: attachmentsResult.rows.map(mapAttachmentRow),
  }
}

export async function createEvent(userId, event) {
  const result = await query(
    `insert into events (user_id, name, type, event_date, bookkeeper_name, location, description)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, name, type, event_date, bookkeeper_name, location, description, created_at`,
    [
      userId,
      event.name,
      event.type,
      event.date,
      event.bookkeeperName,
      event.location ?? null,
      event.description ?? null,
    ]
  )

  return mapEventRow(result.rows[0])
}

export async function updateEvent(userId, eventId, event) {
  const result = await query(
    `update events
     set name = $3,
         type = $4,
         event_date = $5,
         bookkeeper_name = $6,
         location = $7,
         description = $8
     where id = $1 and user_id = $2
     returning id, name, type, event_date, bookkeeper_name, location, description, created_at`,
    [
      eventId,
      userId,
      event.name,
      event.type,
      event.date,
      event.bookkeeperName,
      event.location ?? null,
      event.description ?? null,
    ]
  )

  return result.rows[0] ? mapEventRow(result.rows[0]) : null
}

export async function deleteEvent(userId, eventId) {
  const result = await query(
    'delete from events where id = $1 and user_id = $2 returning id',
    [eventId, userId]
  )

  return result.rowCount > 0
}

export async function createGiftRecord(userId, record) {
  const result = await query(
    `insert into gift_records (event_id, guest_name, amount, gift_item, relative_title, phone_number, home_address, record_date, note)
     select $1, $3, $4, $5, $6, $7, $8, $9, $10
     from events
     where events.id = $1 and events.user_id = $2
     returning id, guest_name, amount, gift_item, relative_title, phone_number, home_address, record_date, event_id, note, created_at, updated_at`,
    [
      record.eventId,
      userId,
      record.guestName,
      record.amount,
      record.giftItem ?? '',
      record.relativeTitle ?? null,
      record.phoneNumber ?? null,
      record.homeAddress ?? null,
      record.date,
      record.note ?? null,
    ]
  )

  return result.rows[0] ? mapGiftRecordRow(result.rows[0]) : null
}

export async function findGiftRecordByGuestName(userId, eventId, guestName, excludeRecordId) {
  const normalizedName = normalizeGiftRecordName(guestName)

  if (!normalizedName) {
    return null
  }

  const result = await query(
    `select gift_records.id,
            gift_records.guest_name,
            gift_records.amount,
            gift_records.gift_item,
            gift_records.relative_title,
            gift_records.phone_number,
            gift_records.home_address,
            gift_records.record_date,
            gift_records.event_id,
            gift_records.note,
            gift_records.updated_at,
            gift_records.created_at
     from gift_records
     inner join events on events.id = gift_records.event_id
     where gift_records.event_id = $1
       and events.user_id = $2
       and lower(regexp_replace(gift_records.guest_name, '\\s+', '', 'g')) = $3
       and ($4::uuid is null or gift_records.id <> $4::uuid)
     limit 1`,
    [eventId, userId, normalizedName, excludeRecordId ?? null]
  )

  return result.rows[0] ? mapGiftRecordRow(result.rows[0]) : null
}

export async function getGiftRecordById(userId, recordId) {
  const result = await query(
    `select gift_records.id,
            gift_records.guest_name,
            gift_records.amount,
            gift_records.gift_item,
            gift_records.relative_title,
            gift_records.phone_number,
            gift_records.home_address,
            gift_records.record_date,
            gift_records.event_id,
            gift_records.note,
            gift_records.updated_at,
            gift_records.created_at
     from gift_records
     inner join events on events.id = gift_records.event_id
     where gift_records.id = $1 and events.user_id = $2`,
    [recordId, userId]
  )

  return result.rows[0] ? mapGiftRecordRow(result.rows[0]) : null
}

export async function listGiftRecordsByEvent(userId, eventId) {
  const result = await query(
    `select gift_records.id,
            gift_records.guest_name,
            gift_records.amount,
            gift_records.gift_item,
            gift_records.relative_title,
            gift_records.phone_number,
            gift_records.home_address,
            gift_records.record_date,
            gift_records.event_id,
            gift_records.note,
            gift_records.updated_at,
            gift_records.created_at
     from gift_records
     inner join events on events.id = gift_records.event_id
     where gift_records.event_id = $1 and events.user_id = $2
     order by gift_records.created_at desc`,
    [eventId, userId]
  )

  return result.rows.map(mapGiftRecordRow)
}

export async function updateGiftRecord(userId, recordId, record) {
  return withTransaction(async (client) => {
    const ownerResult = await client.query(
      `select gift_records.id
       from gift_records
       inner join events on events.id = gift_records.event_id
       where gift_records.id = $1 and events.user_id = $2`,
      [recordId, userId]
    )

    if (ownerResult.rowCount === 0) {
      return null
    }

    const result = await client.query(
      `update gift_records
       set guest_name = coalesce($2, guest_name),
           amount = coalesce($3, amount),
           gift_item = coalesce($4, gift_item),
           relative_title = $5,
           phone_number = $6,
           home_address = $7,
           record_date = coalesce($8, record_date),
           note = $9,
           updated_at = now()
       where id = $1
       returning id, guest_name, amount, gift_item, relative_title, phone_number, home_address, record_date, event_id, note, created_at, updated_at`,
      [
        recordId,
        record.guestName,
        record.amount,
        record.giftItem,
        record.relativeTitle ?? null,
        record.phoneNumber ?? null,
        record.homeAddress ?? null,
        record.date,
        record.note ?? null,
      ]
    )

    return mapGiftRecordRow(result.rows[0])
  })
}

export async function deleteGiftRecord(userId, recordId) {
  const result = await query(
    `delete from gift_records
     using events
     where gift_records.id = $1
       and gift_records.event_id = events.id
       and events.user_id = $2
     returning gift_records.id`,
    [recordId, userId]
  )

  return result.rowCount > 0
}
