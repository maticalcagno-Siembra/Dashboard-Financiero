import crypto from 'crypto'
import prisma from '../../../lib/prisma'
import { sendPasswordResetEmail } from '../../../lib/email'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email requerido' })

  // Siempre responder OK para no revelar si el email existe
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (user) {
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: token, resetPasswordExpires: expires },
    })

    sendPasswordResetEmail(user.email, user.name, token).catch(console.error)
  }

  return res.status(200).json({ ok: true })
}
