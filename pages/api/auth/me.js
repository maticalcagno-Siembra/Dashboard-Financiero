import prisma from '../../../lib/prisma'
import { getTokenFromRequest, verifyToken } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const token = getTokenFromRequest(req)
  if (!token) return res.status(401).json({ user: null })

  const payload = verifyToken(token)
  if (!payload) return res.status(401).json({ user: null })

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true, email: true, name: true, phone: true, role: true, active: true, createdAt: true },
  })

  if (!user || !user.active) return res.status(401).json({ user: null })

  return res.status(200).json({ user })
}
