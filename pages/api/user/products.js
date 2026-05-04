import prisma from '../../../lib/prisma'
import { requireAuth } from '../../../lib/auth'

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido' })

  const userProducts = await prisma.userProduct.findMany({
    where: { userId: req.user.id, active: true },
    include: { product: true },
    orderBy: { purchasedAt: 'desc' },
  })

  return res.status(200).json({ products: userProducts.map(up => ({ ...up.product, purchasedAt: up.purchasedAt })) })
})
