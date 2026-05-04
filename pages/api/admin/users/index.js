import bcrypt from 'bcryptjs'
import prisma from '../../../../lib/prisma'
import { requireAdmin } from '../../../../lib/auth'
import { sendWelcomeEmail } from '../../../../lib/email'

export default requireAdmin(async function handler(req, res) {
  if (req.method === 'GET') {
    const { search } = req.query
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, active: true, createdAt: true,
        products: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({ users })
  }

  if (req.method === 'POST') {
    const { name, email, password, phone, role } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' })

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: phone?.trim() || null,
        role: role === 'ADMIN' ? 'ADMIN' : 'USER',
      },
      select: { id: true, email: true, name: true, role: true },
    })

    sendWelcomeEmail(user.email, user.name).catch(console.error)
    return res.status(201).json({ user })
  }

  return res.status(405).json({ error: 'Método no permitido' })
})
