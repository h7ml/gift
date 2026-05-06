const DIGITS = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
const SECTION_UNITS = ['', '万', '亿', '兆']
const PLACE_UNITS = ['', '拾', '佰', '仟']

export function formatChineseMoney(amount) {
  if (!Number.isFinite(amount) || amount < 0) {
    return ''
  }

  const cents = Math.round(amount * 100)
  const yuan = Math.floor(cents / 100)
  const jiao = Math.floor((cents % 100) / 10)
  const fen = cents % 10

  if (yuan === 0 && jiao === 0 && fen === 0) {
    return '零元整'
  }

  const yuanText = yuan > 0 ? `${formatInteger(yuan)}元` : ''
  const decimalText = formatDecimal(jiao, fen, yuan > 0)

  return `${yuanText}${decimalText || '整'}`
}

function formatInteger(value) {
  const sections = []
  let remaining = value

  while (remaining > 0) {
    sections.push(remaining % 10000)
    remaining = Math.floor(remaining / 10000)
  }

  let result = ''
  let needsZero = false

  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const section = sections[index]

    if (section === 0) {
      needsZero = result !== ''
      continue
    }

    if (needsZero || (result && section < 1000)) {
      result += '零'
    }

    result += `${formatSection(section)}${SECTION_UNITS[index]}`
    needsZero = section < 1000 && index > 0
  }

  return result
}

function formatSection(value) {
  let result = ''
  let zeroPending = false

  for (let place = 3; place >= 0; place -= 1) {
    const unitValue = 10 ** place
    const digit = Math.floor(value / unitValue) % 10

    if (digit === 0) {
      zeroPending = result !== ''
      continue
    }

    if (zeroPending) {
      result += '零'
    }

    result += `${DIGITS[digit]}${PLACE_UNITS[place]}`
    zeroPending = false
  }

  return result
}

function formatDecimal(jiao, fen, hasYuan) {
  if (jiao === 0 && fen === 0) {
    return ''
  }

  if (jiao > 0 && fen > 0) {
    return `${DIGITS[jiao]}角${DIGITS[fen]}分`
  }

  if (jiao > 0) {
    return `${DIGITS[jiao]}角`
  }

  return `${hasYuan ? '零' : ''}${DIGITS[fen]}分`
}
