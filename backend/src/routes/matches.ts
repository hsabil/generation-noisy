import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// ============================================
// GET /api/matches/my — Mes échanges
// ============================================
router.get('/my', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string

    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { seekerId: userId },
          { helperId: userId },
        ],
      },
      include: {
        service: true,
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            quartier: true,
          },
        },
        helper: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            quartier: true,
          },
        },
        rating: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(matches)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ============================================
// POST /api/matches — Proposer un échange
// ============================================
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { serviceId, message } = req.body
    const userId = req.userId as string

    if (!serviceId) {
      return res.status(400).json({ error: 'serviceId est obligatoire' })
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    })

    if (!service) {
      return res.status(404).json({ error: 'Annonce non trouvée' })
    }

    // Accepter les propositions sur les annonces ACTIVE et MATCHED
    if (service.status !== 'ACTIVE' && service.status !== 'MATCHED') {
      return res.status(400).json({ error: "Cette annonce n'est plus disponible" })
    }

    if (service.authorId === userId) {
      return res.status(400).json({ error: 'Vous ne pouvez pas échanger avec vous-même' })
    }

    const existing = await prisma.match.findFirst({
      where: {
        serviceId,
        seekerId: userId,
      },
    })

    if (existing) {
      return res.status(409).json({ error: 'Vous avez déjà proposé un échange pour cette annonce' })
    }

    const seekerId = service.type === 'OFFER' ? userId : service.authorId
    const helperId = service.type === 'OFFER' ? service.authorId : userId

    const match = await prisma.match.create({
      data: {
        serviceId,
        seekerId,
        helperId,
        message,
        status: 'PROPOSED',
        // ✅ Le service reste ACTIVE — pas de changement de statut ici
      },
      include: {
        service: true,
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        helper: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Notification pour l'auteur de l'annonce
    await prisma.notification.create({
      data: {
        userId: service.authorId,
        type: 'MATCH_PROPOSED',
        title: "Nouvelle proposition d'échange",
        message: `Quelqu'un est intéressé par votre annonce : ${service.title}`,
      },
    })

    res.status(201).json(match)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la création du match' })
  }
})

// ============================================
// PATCH /api/matches/:id — Changer le statut
// ============================================
router.patch('/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const { status } = req.body
    const userId = req.userId as string

    const match = await prisma.match.findUnique({
      where: { id },
      include: { service: true },
    })

    if (!match) {
      return res.status(404).json({ error: 'Échange non trouvé' })
    }

    if (match.seekerId !== userId && match.helperId !== userId) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const transitions: any = {
      PROPOSED:    ['ACCEPTED', 'CANCELLED'],
      ACCEPTED:    ['IN_PROGRESS', 'CANCELLED'],
      IN_PROGRESS: ['COMPLETED', 'DISPUTED'],
      DISPUTED:    ['RESOLVED'],
    }

    if (!transitions[match.status]?.includes(status)) {
      return res.status(400).json({
        error: `Transition invalide : ${match.status} → ${status}`,
      })
    }

    // ============================================
    // ACCEPTED → Service passe en MATCHED ✅
    // ============================================
    if (status === 'ACCEPTED') {
      await prisma.service.update({
        where: { id: match.serviceId },
        data: { status: 'MATCHED' },
      })

      await prisma.notification.create({
        data: {
          userId: match.seekerId,
          type: 'MATCH_ACCEPTED',
          title: 'Échange accepté !',
          message: `Votre échange pour "${match.service.title}" a été accepté`,
        },
      })
    }

    // ============================================
    // COMPLETED → Transfert crédits + Service COMPLETED ✅
    // ============================================
    if (status === 'COMPLETED') {
      const credits = match.service.credits

      const seeker = await prisma.user.findUnique({
        where: { id: match.seekerId },
      })

      if (!seeker) {
        return res.status(404).json({ error: 'Utilisateur non trouvé' })
      }

      if (seeker.credits - credits < -5) {
        return res.status(400).json({
          error: `Solde insuffisant. Minimum autorisé : -5 crédits`,
        })
      }

      await prisma.user.update({
        where: { id: match.seekerId },
        data: { credits: { decrement: credits } },
      })

      await prisma.user.update({
        where: { id: match.helperId },
        data: { credits: { increment: credits } },
      })

      // ✅ Service passe en COMPLETED
      await prisma.service.update({
        where: { id: match.serviceId },
        data: { status: 'COMPLETED' },
      })

      await prisma.notification.createMany({
        data: [
          {
            userId: match.seekerId,
            type: 'MATCH_COMPLETED',
            title: 'Échange terminé !',
            message: `${credits} crédit(s) débité(s) pour : ${match.service.title}`,
          },
          {
            userId: match.helperId,
            type: 'MATCH_COMPLETED',
            title: 'Échange terminé !',
            message: `${credits} crédit(s) reçu(s) pour : ${match.service.title}`,
          },
        ],
      })
    }

    // ============================================
    // CANCELLED → Service repasse en ACTIVE ✅
    // ============================================
    if (status === 'CANCELLED') {
      await prisma.service.update({
        where: { id: match.serviceId },
        data: { status: 'ACTIVE' },
      })
    }

    const updated = await prisma.match.update({
      where: { id },
      data: { status },
      include: {
        service: true,
        seeker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            credits: true,
          },
        },
        helper: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            credits: true,
          },
        },
      },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour' })
  }
})

export default router