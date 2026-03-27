import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// ============================================
// GET /api/messages/:matchId — Historique du chat
// ============================================
router.get('/:matchId', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const matchId = req.params.matchId as string
    const userId = req.userId as string

    // Vérifier que l'utilisateur fait partie de cet échange
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    })

    if (!match) {
      return res.status(404).json({ error: 'Échange non trouvé' })
    }

    if (match.seekerId !== userId && match.helperId !== userId) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { matchId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    res.json(messages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router