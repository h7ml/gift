import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Event, GiftRecord } from './types'
import { formatChineseMoney } from './chinese-money.js'

interface ExportPdfOptions {
  coverImageDataUrl?: string | null
  interfaceStyle?: 'red' | 'gray'
}

export function exportToExcel(records: GiftRecord[], event: Event) {
  const data = records.map((record, index) => ({
    '序号': index + 1,
    '记账人': event.bookkeeperName || '-',
    '姓名': record.guestName,
    '亲戚称谓': record.relativeTitle || '-',
    '联系电话': record.phoneNumber || '-',
    '住宅地址': record.homeAddress || '-',
    '金额（元）': record.amount,
    '金额大写': formatChineseMoney(record.amount),
    '已还礼': record.returnGiftDone ? '是' : '否',
    '还礼金额': record.returnGiftAmount ?? '',
    '还礼备注': record.returnGiftNote || '-',
    '礼品': record.giftItem || '-',
    '日期': format(new Date(record.date), 'yyyy年MM月dd日', { locale: zhCN }),
    '备注': record.note || '-',
    '录入时间': format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm'),
    '更新时间': format(new Date(record.updatedAt), 'yyyy-MM-dd HH:mm')
  }))

  // 添加汇总行
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
  data.push({
    '序号': '' as unknown as number,
    '记账人': event.bookkeeperName || '-',
    '姓名': '合计',
    '亲戚称谓': '-',
    '联系电话': '-',
    '住宅地址': '-',
    '金额（元）': totalAmount,
    '金额大写': formatChineseMoney(totalAmount),
    '已还礼': '-',
    '还礼金额': records.reduce((sum, r) => sum + (r.returnGiftAmount ?? 0), 0),
    '还礼备注': '-',
    '礼品': '-',
    '日期': '-',
    '备注': `共 ${records.length} 人`,
    '录入时间': '-',
    '更新时间': '-'
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  
  // 设置列宽
  worksheet['!cols'] = [
    { wch: 6 },  // 序号
    { wch: 12 }, // 记账人
    { wch: 12 }, // 姓名
    { wch: 12 }, // 亲戚称谓
    { wch: 15 }, // 联系电话
    { wch: 24 }, // 住宅地址
    { wch: 12 }, // 金额
    { wch: 28 }, // 金额大写
    { wch: 10 }, // 已还礼
    { wch: 12 }, // 还礼金额
    { wch: 20 }, // 还礼备注
    { wch: 15 }, // 礼品
    { wch: 15 }, // 日期
    { wch: 20 }, // 备注
    { wch: 18 }, // 录入时间
    { wch: 18 }  // 更新时间
  ]

  XLSX.utils.book_append_sheet(workbook, worksheet, event.name)
  
  const fileName = `${event.name}_礼薄_${format(new Date(), 'yyyyMMdd')}.xlsx`
  XLSX.writeFile(workbook, fileName)
}

export function exportToPDF(
  records: GiftRecord[],
  event: Event,
  options: ExportPdfOptions = {}
) {
  const doc = new jsPDF()
  const palette =
    options.interfaceStyle === 'gray'
      ? {
          head: [78, 78, 78] as [number, number, number],
          alternate: [246, 246, 246] as [number, number, number],
          foot: [232, 232, 232] as [number, number, number],
          footText: [55, 55, 55] as [number, number, number],
        }
      : {
          head: [185, 28, 28] as [number, number, number],
          alternate: [255, 245, 238] as [number, number, number],
          foot: [255, 235, 225] as [number, number, number],
          footText: [139, 69, 19] as [number, number, number],
        }
  let startY = event.location ? 62 : 55

  if (options.coverImageDataUrl) {
    try {
      doc.addImage(options.coverImageDataUrl, 'JPEG', 20, 12, 170, 60)
      startY = 88
    } catch {
      doc.addImage(options.coverImageDataUrl, 'PNG', 20, 12, 170, 60)
      startY = 88
    }
  }
  
  // 添加标题
  doc.setFontSize(18)
  doc.text(event.name + ' - 礼金记录', 105, options.coverImageDataUrl ? 80 : 20, {
    align: 'center',
  })
  
  doc.setFontSize(12)
  const metaStartY = options.coverImageDataUrl ? 94 : 35
  doc.text(`活动类型: ${event.type}`, 20, metaStartY)
  doc.text(`活动日期: ${format(new Date(event.date), 'yyyy年MM月dd日', { locale: zhCN })}`, 20, metaStartY + 7)
  doc.text(`记账人: ${event.bookkeeperName || '-'}`, 20, metaStartY + 14)
  if (event.location) {
    doc.text(`活动地点: ${event.location}`, 20, metaStartY + 21)
  }
  startY = Math.max(startY, event.location ? metaStartY + 28 : metaStartY + 21)

  // 添加表格
  const tableData = records.map((record, index) => [
    index + 1,
    record.guestName,
    record.phoneNumber || '-',
    record.homeAddress || '-',
    `¥${record.amount.toLocaleString()}`,
    formatChineseMoney(record.amount),
    record.returnGiftDone ? 'Yes' : 'No',
    typeof record.returnGiftAmount === 'number'
      ? `¥${record.returnGiftAmount.toLocaleString()}`
      : '-',
    record.returnGiftNote || '-',
    record.giftItem || '-',
    format(new Date(record.date), 'MM/dd'),
    record.note || '-'
  ])

  // 添加汇总行
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0)
  tableData.push([
    '',
    'Total',
    '-',
    '-',
    `¥${totalAmount.toLocaleString()}`,
    formatChineseMoney(totalAmount),
    '-',
    `¥${records.reduce((sum, r) => sum + (r.returnGiftAmount ?? 0), 0).toLocaleString()}`,
    '-',
    '-',
    '-',
    `${records.length} guests`
  ])

  autoTable(doc, {
    head: [['#', 'Name', 'Phone', 'Address', 'Amount', 'Uppercase', 'Returned', 'Return Amount', 'Return Note', 'Gift', 'Date', 'Note']],
    body: tableData,
    startY,
    styles: {
      fontSize: 10,
      cellPadding: 3
    },
    headStyles: {
      fillColor: palette.head,
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: palette.alternate
    },
    footStyles: {
      fillColor: palette.foot,
      textColor: palette.footText,
      fontStyle: 'bold'
    }
  })

  // 添加页脚
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(150)
    doc.text(
      `Generated on ${format(new Date(), 'yyyy-MM-dd HH:mm')} - Page ${i}/${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  const fileName = `${event.name}_礼薄_${format(new Date(), 'yyyyMMdd')}.pdf`
  doc.save(fileName)
}

export function exportAllToExcel(events: Event[], records: GiftRecord[]) {
  const workbook = XLSX.utils.book_new()

  events.forEach(event => {
    const eventRecords = records.filter(r => r.eventId === event.id)
    if (eventRecords.length === 0) return

    const data = eventRecords.map((record, index) => ({
      '序号': index + 1,
      '记账人': event.bookkeeperName || '-',
      '姓名': record.guestName,
      '亲戚称谓': record.relativeTitle || '-',
      '联系电话': record.phoneNumber || '-',
      '住宅地址': record.homeAddress || '-',
      '金额（元）': record.amount,
      '金额大写': formatChineseMoney(record.amount),
      '已还礼': record.returnGiftDone ? '是' : '否',
      '还礼金额': record.returnGiftAmount ?? '',
      '还礼备注': record.returnGiftNote || '-',
      '礼品': record.giftItem || '-',
      '日期': format(new Date(record.date), 'yyyy年MM月dd日', { locale: zhCN }),
      '备注': record.note || '-',
      '录入时间': format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm'),
      '更新时间': format(new Date(record.updatedAt), 'yyyy-MM-dd HH:mm')
    }))

    const totalAmount = eventRecords.reduce((sum, r) => sum + r.amount, 0)
    data.push({
      '序号': '' as unknown as number,
      '记账人': event.bookkeeperName || '-',
      '姓名': '合计',
      '亲戚称谓': '-',
      '联系电话': '-',
      '住宅地址': '-',
      '金额（元）': totalAmount,
      '金额大写': formatChineseMoney(totalAmount),
      '已还礼': '-',
      '还礼金额': eventRecords.reduce((sum, r) => sum + (r.returnGiftAmount ?? 0), 0),
      '还礼备注': '-',
      '礼品': '-',
      '日期': '-',
      '备注': `共 ${eventRecords.length} 人`,
      '录入时间': '-',
      '更新时间': '-'
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 15 },
      { wch: 24 },
      { wch: 12 },
      { wch: 28 },
      { wch: 10 },
      { wch: 12 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
      { wch: 18 }
    ]

    // 截取活动名称作为工作表名（Excel 限制 31 字符）
    const sheetName = event.name.slice(0, 28)
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  const fileName = `全部礼薄_${format(new Date(), 'yyyyMMdd')}.xlsx`
  XLSX.writeFile(workbook, fileName)
}
