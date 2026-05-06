import { jsonError, readJson, requireString } from '@/lib/api.js'
import {
  createSession,
  findUserWithPasswordByEmail,
  verifyPassword,
} from '@/lib/db/auth.js'
import { setSessionCookie } from '@/lib/server-auth.js'

export async function POST(request) {
  try {
    const body = await readJson(request)
    const email = requireString(body.email, '请输入邮箱')
    const password = requireString(body.password, '请输入密码')
    const user = await findUserWithPasswordByEmail(email)

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return jsonError('邮箱或密码错误', 401)
    }

    const token = await createSession(user.id)
    await setSessionCookie(token)

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt:
          user.created_at instanceof Date
            ? user.created_at.toISOString()
            : user.created_at,
      },
    })
  } catch (error) {
    return jsonError(error.message)
  }
}
