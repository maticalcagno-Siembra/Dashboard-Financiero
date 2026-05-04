import prisma from '../../../../lib/prisma'
import { requireAdmin } from '../../../../lib/auth'

export default requireAdmin(async function handler(req, res) {
  if (req.method === 'GET') {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json({ products })
  }

  if (req.method === 'POST') {
    const { name, slug, description, price, type, imageUrl, accessUrl } = req.body
    if (!name || !slug || price === undefined) return res.status(400).json({ error: 'Nombre, slug y precio son requeridos' })

    const existing = await prisma.product.findUnique({ where: { slug } })
    if (existing) return res.status(409).json({ error: 'Ya existe un producto con ese slug' })

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        price: parseFloat(price),
        type: type || 'PRODUCT',
        imageUrl: imageUrl?.trim() || null,
        accessUrl: accessUrl?.trim() || null,
      },
    })
    return res.status(201).json({ product })
  }

  if (req.method === 'PUT') {
    const { id, name, description, price, type, active, imageUrl, accessUrl } = req.body
    if (!id) return res.status(400).json({ error: 'id requerido' })

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(type && { type }),
        ...(typeof active === 'boolean' && { active }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
        ...(accessUrl !== undefined && { accessUrl: accessUrl?.trim() || null }),
      },
    })
    return res.status(200).json({ product })
  }

  return res.status(405).json({ error: 'Método no permitido' })
})
