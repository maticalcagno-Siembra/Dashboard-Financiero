import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'
import { signToken, setAuthCookie } from '../../../lib/auth'
import { sendWelcomeEmail } from '../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { name, email, password, phone } = req.body

  if (!name?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' })
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Email inválido' })
  }

  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (existing) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone?.trim() || null,
    },
    select: { id: true, email: true, name: true, role: true },
  })

  // Enviar email de bienvenida (no bloqueante)
  sendWelcomeEmail(user.email, user.name).catch(console.error)

  const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role })
  setAuthCookie(res, token)

  return res.status(201).json({ user })
}
