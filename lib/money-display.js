import { formatChineseMoney } from './chinese-money.js'

const MASKED_MONEY = '¥***'
const MASKED_UPPERCASE_MONEY = '***'

export function formatDisplayMoney(amount, maskAmounts) {
  if (maskAmounts) {
    return MASKED_MONEY
  }

  return `¥${amount.toLocaleString()}`
}

export function formatDisplayChineseMoney(amount, maskAmounts) {
  if (maskAmounts) {
    return MASKED_UPPERCASE_MONEY
  }

  return formatChineseMoney(amount)
}
