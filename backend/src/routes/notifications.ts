import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// GET /api/notifications — Liste des notifications
router.get('/', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    })

    res.json({ notifications, unreadCount })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/notifications/read-all — Tout marquer comme lu
router.patch('/read-all', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId as string

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    })

    res.json({ message: 'Toutes les notifications marquées comme lues' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PATCH /api/notifications/:id/read — Marquer une notif comme lue
router.patch('/:id/read', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string
    const userId = req.userId as string

    const notif = await prisma.notification.findUnique({ where: { id } })
    if (!notif) return res.status(404).json({ error: 'Notification non trouvée' })
    if (notif.userId !== userId) return res.status(403).json({ error: 'Non autorisé' })

    const updated = await prisma.notification.update({
      where: { id },
      data: { read: true },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
