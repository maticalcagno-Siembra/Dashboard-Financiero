import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'

export default requireAuth(async function handler(req, res) {
  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
    })
    return res.status(200).json({ user })
  }

  if (req.method === 'PUT') {
    const { name, phone, currentPassword, newPassword } = req.body
    const updates = {}

    if (name?.trim()) updates.name = name.trim()
    if (phone !== undefined) updates.phone = phone?.trim() || null

    if (newPassword) {
      if (newPassword.length < 8) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' })
      const user = await prisma.user.findUnique({ where: { id: req.user.id } })
      if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' })
      }
      updates.password = await bcrypt.hash(newPassword, 10)
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: { id: true, email: true, name: true, phone: true, role: true },
    })
    return res.status(200).json({ user: updated })
  }

  return res.status(405).json({ error: 'Método no permitido' })
})
