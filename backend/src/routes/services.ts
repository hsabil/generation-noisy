import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// ============================================
// GET /api/services — Lister toutes les annonces
// ============================================
router.get('/', async (req: any, res: Response) => {
  try {
    const {
      type,
      category,
      quartier,
      minCredits,
      maxCredits,
      status,        // ✅ Nouveau filtre statut
      page = 1,
      limit = 10,
    } = req.query

    const where: any = {}

    // ✅ Filtre statut : par défaut ACTIVE seulement
    if (status && status !== 'ALL') {
      where.status = status
    } else if (!status) {
      where.status = 'ACTIVE'
    }

    if (type) where.type = type
    if (category) where.category = category
    if (quartier) where.quartier = quartier
    if (minCredits || maxCredits) {
      where.credits = {}
      if (minCredits) where.credits.gte = parseFloat(minCredits)
      if (maxCredits) where.credits.lte = parseFloat(maxCredits)
    }

    const skip = (parseInt(page) - 1) * parseInt(limit)

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              quartier: true,
              avatar: true,
              credits: true,
            },
          },
          // ✅ Compter les propositions PROPOSED reçues
          _count: {
            select: {
              matches: {
                where: { status: 'PROPOSED' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.service.count({ where }),
    ])

    res.json({
      services,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ============================================
// GET /api/services/:id — Détail d'une annonce
// ============================================
router.get('/my', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string

    const services = await prisma.service.findMany({
      where: { authorId: userId },
      include: {
        _count: {
          select: {
            matches: { where: { status: 'PROPOSED' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(services)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/:id', async (req: any, res: Response) => {
  try {
    const id = req.params.id as string

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            quartier: true,
            avatar: true,
            credits: true,
          },
        },
        // ✅ Inclure les matches en cours avec leur statut
        matches: {
          select: {
            id: true,
            status: true,
            createdAt: true,
            seeker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        // ✅ Compter les propositions reçues
        _count: {
          select: {
            matches: {
              where: { status: 'PROPOSED' },
            },
          },
        },
      },
    })

    if (!service) {
      return res.status(404).json({ error: 'Annonce non trouvée' })
    }

    res.json(service)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ============================================
// POST /api/services — Créer une annonce
// ============================================
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, type, category, credits, quartier } = req.body

    if (!title || !description || !type || !category || !credits || !quartier) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' })
    }

    if (!['OFFER', 'REQUEST'].includes(type)) {
      return res.status(400).json({ error: 'Type invalide : OFFER ou REQUEST' })
    }

    if (![0.5, 1, 1.5, 2].includes(parseFloat(credits))) {
      return res.status(400).json({ error: 'Crédits invalides : 0.5, 1, 1.5 ou 2' })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const service = await prisma.service.create({
      data: {
        title,
        description,
        type,
        category,
        credits: parseFloat(credits),
        quartier,
        expiresAt,
        authorId: req.userId as string,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            quartier: true,
            avatar: true,
          },
        },
      },
    })

    res.status(201).json(service)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})

// ============================================
// PATCH /api/services/:id — Modifier une annonce
// ============================================
router.patch('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { title, description, category, credits, quartier } = req.body

    const service = await prisma.service.findUnique({ where: { id } })

    if (!service) {
      return res.status(404).json({ error: 'Annonce non trouvée' })
    }

    if (service.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const updated = await prisma.service.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(credits && { credits: parseFloat(credits) }),
        ...(quartier && { quartier }),
      },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la modification' })
  }
})

// ============================================
// DELETE /api/services/:id — Supprimer une annonce
// ============================================
router.delete('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string

    const service = await prisma.service.findUnique({ where: { id } })

    if (!service) {
      return res.status(404).json({ error: 'Annonce non trouvée' })
    }

    if (service.authorId !== req.userId) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    await prisma.service.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    res.json({ message: 'Annonce supprimée avec succès' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la suppression' })
  }
})

export default router