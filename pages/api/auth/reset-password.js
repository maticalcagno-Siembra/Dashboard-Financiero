import bcrypt from 'bcryptjs'
import prisma from '../../../lib/prisma'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { token, password } = req.body
  if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos' })
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' })

  const user = await prisma.user.findUnique({ where: { resetPasswordToken: token } })

  if (!user || !user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
    return res.status(400).json({ error: 'El enlace expiró o no es válido. Solicitá uno nuevo.' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null },
  })

  return res.status(200).json({ ok: true })
}
