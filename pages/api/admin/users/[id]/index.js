import bcrypt from 'bcryptjs'
import prisma from '../../../../../lib/prisma'
import { requireAdmin } from '../../../../../lib/auth'

export default requireAdmin(async function handler(req, res) {
  const { id } = req.query

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, phone: true,
        role: true, active: true, createdAt: true,
        products: {
          include: { product: { select: { id: true, name: true, slug: true, type: true } } },
        },
      },
    })
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
    return res.status(200).json({ user })
  }

  if (req.method === 'PUT') {
    const { name, phone, role, active, newPassword } = req.body
    const updates = {}

    if (name?.trim()) updates.name = name.trim()
    if (phone !== undefined) updates.phone = phone?.trim() || null
    if (role === 'ADMIN' || role === 'USER') updates.role = role
    if (typeof active === 'boolean') updates.active = active
    if (newPassword) {
      if (newPassword.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })
      updates.password = await bcrypt.hash(newPassword, 10)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updates,
      select: { id: true, email: true, name: true, phone: true, role: true, active: true },
    })
    return res.status(200).json({ user })
  }

  if (req.method === 'DELETE') {
    await prisma.user.delete({ where: { id } })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método no permitido' })
})
