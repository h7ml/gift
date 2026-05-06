import { jsonError } from '@/lib/api.js'
import { createGiftRecord, listGiftRecordsByEvent } from '@/lib/db/gifts.js'
import {
  findDuplicateGiftRecordNames,
  findDuplicateGiftRecords,
  parseGiftRecordsFromExcelBuffer,
} from '@/lib/excel-import.js'
import { requireCurrentUser } from '@/lib/server-auth.js'

const MAX_IMPORT_SIZE = 10 * 1024 * 1024

export async function POST(request, { params }) {
  const user = await requireCurrentUser()

  if (!user) {
    return jsonError('请先登录', 401)
  }

  const { id } = await params
  const url = new URL(request.url)
  const confirmDuplicates = url.searchParams.get('confirmDuplicates') === 'true'
  const formData = await request.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return jsonError('请选择 Excel 文件')
  }

  if (file.size > MAX_IMPORT_SIZE) {
    return jsonError('Excel 文件不能超过 10MB')
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const records = parseGiftRecordsFromExcelBuffer(buffer, id)
    const existingRecords = await listGiftRecordsByEvent(user.id, id)
    const duplicates = [
      ...findDuplicateGiftRecords(records, existingRecords),
      ...findDuplicateGiftRecordNames(records, existingRecords),
    ]

    if (duplicates.length > 0 && !confirmDuplicates) {
      return Response.json(
        {
          duplicateCount: duplicates.length,
          duplicates: duplicates.slice(0, 10),
          totalCount: records.length,
        },
        { status: 409 }
      )
    }

    const importedRecords = []

    for (const record of records) {
      const importedRecord = await createGiftRecord(user.id, record)

      if (!importedRecord) {
        return jsonError('活动不存在', 404)
      }

      importedRecords.push(importedRecord)
    }

    return Response.json({ records: importedRecords }, { status: 201 })
  } catch (error) {
    return jsonError(error.message || 'Excel 导入失败')
  }
}
