import prisma from '../../../../../lib/prisma'
import { requireAdmin } from '../../../../../lib/auth'

export default requireAdmin(async function handler(req, res) {
  const { id } = req.query

  // Habilitar producto a usuario
  if (req.method === 'POST') {
    const { productId } = req.body
    if (!productId) return res.status(400).json({ error: 'productId requerido' })

    const userProduct = await prisma.userProduct.upsert({
      where: { userId_productId: { userId: id, productId } },
      update: { active: true },
      create: { userId: id, productId, active: true },
      include: { product: true },
    })
    return res.status(200).json({ userProduct })
  }

  // Deshabilitar producto
  if (req.method === 'DELETE') {
    const { productId } = req.body
    if (!productId) return res.status(400).json({ error: 'productId requerido' })

    await prisma.userProduct.update({
      where: { userId_productId: { userId: id, productId } },
      data: { active: false },
    })
    return res.status(200).json({ ok: true })
  }

  return res.status(405).json({ error: 'Método no permitido' })
})
