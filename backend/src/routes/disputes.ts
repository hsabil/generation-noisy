import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// ============================================
// POST /api/disputes — Signaler un litige
// ============================================
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId, reason, description } = req.body
    const userId = req.userId as string

    if (!matchId || !reason || !description) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' })
    }

    // Vérifier que le match existe
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { service: true },
    })

    if (!match) {
      return res.status(404).json({ error: 'Échange non trouvé' })
    }

    // Vérifier que l'utilisateur fait partie de cet échange
    if (match.seekerId !== userId && match.helperId !== userId) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Créer le litige
    const dispute = await prisma.dispute.create({
      data: {
        matchId,
        reason,
        description,
        reporterId: userId,
        status: 'OPEN',
      },
    })

    // Mettre le match en statut DISPUTED
    await prisma.match.update({
      where: { id: matchId },
      data: { status: 'DISPUTED' },
    })

    // Notifier l'autre partie
    const otherUserId = userId === match.seekerId
      ? match.helperId
      : match.seekerId

    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'DISPUTE_OPENED',
        title: 'Un litige a été ouvert',
        message: `Un litige a été signalé pour l'échange : ${match.service.title}`,
      },
    })

    res.status(201).json(dispute)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors du signalement' })
  }
})

// ============================================
// GET /api/disputes — Lister les litiges (Coordinateur/Admin)
// ============================================
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string

    // Vérifier le rôle
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || (user.role !== 'COORDINATOR' && user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Accès réservé aux coordinateurs' })
    }

    const disputes = await prisma.dispute.findMany({
      include: {
        match: {
          include: {
            service: true,
            seeker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            helper: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(disputes)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ============================================
// PATCH /api/disputes/:id — Résoudre un litige
// ============================================
router.patch('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { status, resolution } = req.body
    const userId = req.userId as string

    // Vérifier le rôle
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user || (user.role !== 'COORDINATOR' && user.role !== 'SUPER_ADMIN')) {
      return res.status(403).json({ error: 'Accès réservé aux coordinateurs' })
    }

    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { match: { include: { service: true } } },
    })

    if (!dispute) {
      return res.status(404).json({ error: 'Litige non trouvé' })
    }

    const updated = await prisma.dispute.update({
      where: { id },
      data: {
        status,
        resolution,
      },
    })

    // Notifier les 2 parties
    await prisma.notification.createMany({
      data: [
        {
          userId: dispute.match.seekerId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu',
          message: `Le litige pour "${dispute.match.service.title}" a été résolu`,
        },
        {
          userId: dispute.match.helperId,
          type: 'DISPUTE_RESOLVED',
          title: 'Litige résolu',
          message: `Le litige pour "${dispute.match.service.title}" a été résolu`,
        },
      ],
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la résolution' })
  }
})

export default router
