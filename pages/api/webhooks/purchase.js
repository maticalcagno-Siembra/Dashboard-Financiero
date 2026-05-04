import crypto from 'crypto'
import prisma from '../../../lib/prisma'

// Webhook que llama el procesador de pagos (MercadoPago, Stripe, etc.)
// al completarse un pago, para habilitar el producto automáticamente.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  // Verificar firma del webhook si está configurada
  const secret = process.env.WEBHOOK_SECRET
  if (secret) {
    const signature = req.headers['x-webhook-signature'] || req.headers['x-signature']
    if (!signature) return res.status(401).json({ error: 'Firma requerida' })

    const body = JSON.stringify(req.body)
    const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Firma inválida' })
    }
  }

  const { userEmail, productSlug, externalOrderId } = req.body

  if (!userEmail || !productSlug) {
    return res.status(400).json({ error: 'userEmail y productSlug son requeridos' })
  }

  const [user, product] = await Promise.all([
    prisma.user.findUnique({ where: { email: userEmail.toLowerCase() } }),
    prisma.product.findUnique({ where: { slug: productSlug } }),
  ])

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' })
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' })

  await prisma.userProduct.upsert({
    where: { userId_productId: { userId: user.id, productId: product.id } },
    update: { active: true },
    create: { userId: user.id, productId: product.id, active: true },
  })

  console.log(`[webhook] Producto "${product.name}" habilitado para ${user.email} (orden: ${externalOrderId})`)

  return res.status(200).json({ ok: true })
}

export const config = { api: { bodyParser: true } }
