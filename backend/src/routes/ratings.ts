import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// ============================================
// POST /api/ratings — Laisser une note
// ============================================
router.post('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { matchId, score, comment } = req.body
    const userId = req.userId as string

    if (!matchId || !score) {
      return res.status(400).json({ error: 'matchId et score sont obligatoires' })
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ error: 'Le score doit être entre 1 et 5' })
    }

    // Vérifier que le match existe et est complété
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return res.status(404).json({ error: 'Échange non trouvé' })
    }

    if (match.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Vous ne pouvez noter qu\'un échange complété' })
    }

    // Vérifier que l'utilisateur fait partie de cet échange
    if (match.seekerId !== userId && match.helperId !== userId) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Vérifier qu'une note n'existe pas déjà
    const existing = await prisma.rating.findUnique({
      where: { matchId },
    })

    if (existing) {
      return res.status(409).json({ error: 'Une note existe déjà pour cet échange' })
    }

    // Le receveur de la note est l'autre personne
    const receiverId = userId === match.seekerId
      ? match.helperId
      : match.seekerId

    const rating = await prisma.rating.create({
      data: {
        matchId,
        score: parseInt(score),
        comment,
        giverId: userId,
        receiverId,
      },
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    })

    // Notification au receveur
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'RATING_RECEIVED',
        title: 'Vous avez reçu une note !',
        message: `Vous avez reçu ${score} étoile(s) pour un échange`,
      },
    })

    res.status(201).json(rating)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la création de la note' })
  }
})

// ============================================
// GET /api/ratings/user/:id — Notes d'un membre
// ============================================
router.get('/user/:id', async (req: any, res: Response) => {
  try {
    const userId = req.params.id as string

    const ratings = await prisma.rating.findMany({
      where: { receiverId: userId },
      include: {
        giver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculer la moyenne
    const average = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0

    res.json({
      ratings,
      total: ratings.length,
      average: Math.round(average * 10) / 10,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
