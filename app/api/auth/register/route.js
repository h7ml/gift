import { jsonError, readJson, requireString } from '@/lib/api.js'
import { createSession, createUser } from '@/lib/db/auth.js'
import { setSessionCookie } from '@/lib/server-auth.js'

export async function POST(request) {
  try {
    const body = await readJson(request)
    const name = requireString(body.name, '请输入姓名')
    const email = requireString(body.email, '请输入邮箱')
    const password = requireString(body.password, '请输入密码')

    if (password.length < 6) {
      return jsonError('密码长度至少为6位')
    }

    const user = await createUser({ email, password, name })
    const token = await createSession(user.id)
    await setSessionCookie(token)

    return Response.json({ user }, { status: 201 })
  } catch (error) {
    if (error.code === '23505') {
      return jsonError('该邮箱已被注册', 409)
    }

    return jsonError(error.message)
  }
}
