export function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status })
}

export function requireString(value, message) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(message)
  }

  return value.trim()
}

export function optionalString(value) {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed === '' ? undefined : trimmed
}

export async function readJson(request) {
  try {
    return await request.json()
  } catch {
    throw new Error('请求体格式错误')
  }
}
