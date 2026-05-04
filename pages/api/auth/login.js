import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'
import { signToken, setAuthCookie } from '../../../lib/auth'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email y contraseña requeridos' })

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, email: true, name: true, role: true, active: true, password: true },
  })

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email o contraseña incorrectos' })
  }
  if (!user.active) {
    return res.status(403).json({ error: 'Tu cuenta está inactiva. Contactate con soporte.' })
  }

  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })
  setAuthCookie(res, token)

  return res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })
}
