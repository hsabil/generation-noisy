import { Router, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'
import { AuthRequest, verifyToken } from '../middleware/auth'

const router = Router()

// ============================================
// POST /api/auth/register
// ============================================
router.post('/register', async (req: any, res: Response) => {
  try {
    const { firstName, lastName, email, password, quartier } = req.body

    if (!firstName || !lastName || !email || !password || !quartier) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        quartier,
        credits: 0,
      },
    })

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        quartier: user.quartier,
        credits: user.credits,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Erreur lors de l'inscription" })
  }
})

// ============================================
// POST /api/auth/login
// ============================================
router.post('/login', async (req: any, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe obligatoires' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' })
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    )

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        quartier: user.quartier,
        credits: user.credits,
        role: user.role,
        createdAt: user.createdAt,
      },
      token,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la connexion' })
  }
})

// ============================================
// GET /api/auth/me
// ============================================
router.get('/me', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId as string },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        quartier: true,
        bio: true,
        avatar: true,
        credits: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ============================================
// PATCH /api/auth/profile — Modifier le profil ✅
// ============================================
router.patch('/profile', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, quartier, bio } = req.body
    const userId = req.userId as string

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName  && { lastName }),
        ...(quartier  && { quartier }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        quartier: true,
        bio: true,
        avatar: true,
        credits: true,
        role: true,
        createdAt: true,
      },
    })

    res.json(updated)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' })
  }
})

// ============================================
// PATCH /api/auth/password — Changer le mot de passe ✅
// ============================================
router.patch('/password', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.userId as string

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Les deux mots de passe sont obligatoires' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 6 caractères' })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' })
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe actuel incorrect' })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    res.json({ message: 'Mot de passe mis à jour avec succès' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erreur lors du changement de mot de passe' })
  }
})

export default router
