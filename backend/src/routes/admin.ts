import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// Middleware admin
const isAdmin = async (req: AuthRequest, res: Response, next: any) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId as string } })
  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'COORDINATOR')) {
    return res.status(403).json({ error: 'Accès refusé — réservé aux administrateurs' })
  }
  next()
}

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalServices,
      totalMatches,
      totalCompleted,
      totalDisputes,
      activeServices,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.service.count(),
      prisma.match.count(),
      prisma.match.count({ where: { status: 'COMPLETED' } }),
      prisma.match.count({ where: { status: 'DISPUTED' } }),
      prisma.service.count({ where: { status: 'ACTIVE' } }),
    ])

    res.json({
      totalUsers,
      totalServices,
      totalMatches,
      totalCompleted,
      totalDisputes,
      activeServices,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/admin/users
router.get('/users', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        quartier: true,
        credits: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            servicesOffered: true,
            matchesAsSeeker: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/admin/users/:id — modifier rôle ou crédits
router.patch('/users/:id', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { role, credits } = req.body

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role && { role }),
        ...(credits !== undefined && { credits: parseFloat(credits) }),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        credits: true,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/admin/disputes — liste des litiges
router.get('/disputes', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const disputes = await prisma.match.findMany({
      where: { status: 'DISPUTED' },
      include: {
        service: true,
        seeker: { select: { id: true, firstName: true, lastName: true, email: true } },
        helper: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(disputes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/admin/disputes/:id/resolve — résoudre un litige
router.patch('/disputes/:id/resolve', verifyToken, isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { winner } = req.body // 'seeker' ou 'helper'

    // Charger le match avec le service
    const match = await prisma.match.findUnique({
      where: { id },
      include: { service: true },
    })

    if (!match) return res.status(404).json({ error: 'Échange non trouvé' })

    // Résoudre le litige — utiliser CANCELLED car RESOLVED n'est pas dans l'enum
    await prisma.match.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    // Transférer les crédits selon le gagnant
    if (winner === 'helper') {
      await prisma.user.update({
        where: { id: match.seekerId },
        data: { credits: { decrement: match.service.credits } },
      })
      await prisma.user.update({
        where: { id: match.helperId },
        data: { credits: { increment: match.service.credits } },
      })
    }

    // Notifier les deux parties
    await prisma.notification.createMany({
      data: [
        {
          userId: match.seekerId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu',
          message: `Le litige pour "${match.service.title}" a été résolu par un administrateur`,
        },
        {
          userId: match.helperId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu',
          message: `Le litige pour "${match.service.title}" a été résolu par un administrateur`,
        },
      ],
    })

    res.json({ message: 'Litige résolu avec succès' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
