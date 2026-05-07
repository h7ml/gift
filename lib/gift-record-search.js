export function parseGiftRecordSearchQuery(query) {
  const text = query.trim()
  const amountRange = parseAmountRange(text)

  return { text, amountRange }
}

export function filterGiftRecordsBySearchQuery(records, query) {
  const { text, amountRange } = parseGiftRecordSearchQuery(query)

  if (!text) {
    return records
  }

  const normalizedText = text.toLowerCase()

  return records.filter((record) => {
    const matchesText =
      record.guestName.toLowerCase().includes(normalizedText) ||
      record.relativeTitle?.toLowerCase().includes(normalizedText) ||
      record.phoneNumber?.toLowerCase().includes(normalizedText) ||
      record.homeAddress?.toLowerCase().includes(normalizedText) ||
      record.giftItem?.toLowerCase().includes(normalizedText) ||
      record.note?.toLowerCase().includes(normalizedText)

    if (matchesText) {
      return true
    }

    if (!amountRange) {
      return false
    }

    return record.amount >= amountRange.min && record.amount <= amountRange.max
  })
}

function parseAmountRange(text) {
  const normalizedText = text.replace(/[，,]/g, '').trim()

  if (!normalizedText) {
    return null
  }

  const exactAmount = parseAmount(normalizedText)
  if (exactAmount !== null) {
    return { min: exactAmount, max: exactAmount }
  }

  const rangeMatch = normalizedText.match(
    /^(\d+(?:\.\d+)?)\s*(?:-|~|至|到)\s*(\d+(?:\.\d+)?)$/
  )

  if (!rangeMatch) {
    return null
  }

  const firstAmount = Number(rangeMatch[1])
  const secondAmount = Number(rangeMatch[2])

  if (!Number.isFinite(firstAmount) || !Number.isFinite(secondAmount)) {
    return null
  }

  return {
    min: Math.min(firstAmount, secondAmount),
    max: Math.max(firstAmount, secondAmount),
  }
}

function parseAmount(text) {
  if (!/^\d+(?:\.\d+)?$/.test(text)) {
    return null
  }

  const amount = Number(text)
  return Number.isFinite(amount) ? amount : null
}
