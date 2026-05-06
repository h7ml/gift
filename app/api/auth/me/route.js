import { getCurrentUser } from '@/lib/server-auth.js'

export async function GET() {
  const user = await getCurrentUser()

  return Response.json({ user })
}
