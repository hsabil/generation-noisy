import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { prisma } from './lib/prisma'
import authRouter from './routes/auth'
import servicesRouter from './routes/services'
import matchesRouter from './routes/matches'
import ratingsRouter from './routes/ratings'
import disputesRouter from './routes/disputes'
import messagesRouter from './routes/messages'
import notificationsRouter from './routes/notifications'
import adminRouter from './routes/admin'


dotenv.config()

const app = express()
const httpServer = createServer(app)

// ✅ Socket.io avec CORS
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())

// Routes HTTP
app.use('/api/auth', authRouter)
app.use('/api/services', servicesRouter)
app.use('/api/matches', matchesRouter)
app.use('/api/ratings', ratingsRouter)
app.use('/api/disputes', disputesRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/admin', adminRouter)

// Route de santé
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Serveur Génération Noisy opérationnel' })
})

// ✅ Socket.io — Gestion du chat en temps réel
io.on('connection', (socket) => {
  console.log(`🔌 Utilisateur connecté : ${socket.id}`)

  // Rejoindre une room de match
  socket.on('join_match', (matchId: string) => {
    socket.join(matchId)
    console.log(`👥 Socket ${socket.id} a rejoint le match ${matchId}`)
  })

  // Quitter une room de match
  socket.on('leave_match', (matchId: string) => {
    socket.leave(matchId)
    console.log(`👋 Socket ${socket.id} a quitté le match ${matchId}`)
  })

  // Envoyer un message
  socket.on('send_message', async (data: { matchId: string; senderId: string; content: string }) => {
    try {
      const { matchId, senderId, content } = data

      if (!matchId || !senderId || !content) {
        socket.emit('error', { message: 'Données manquantes' })
        return
      }

      // Vérifier que l'utilisateur fait partie du match
      const match = await prisma.match.findUnique({
        where: { id: matchId },
      })

      if (!match) {
        socket.emit('error', { message: 'Match non trouvé' })
        return
      }

      if (match.seekerId !== senderId && match.helperId !== senderId) {
        socket.emit('error', { message: 'Non autorisé' })
        return
      }

      // Sauvegarder le message en base
      const message = await prisma.message.create({
        data: { matchId, senderId, content },
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
      })

      // Notifier l'autre participant
      const receiverId = senderId === match.seekerId ? match.helperId : match.seekerId
      await prisma.notification.create({
        data: {
          userId: receiverId,
          type: 'MESSAGE_RECEIVED',
          title: 'Nouveau message',
          message: `${message.sender.firstName} vous a envoyé un message`,
        },
      })

      // Diffuser le message à tous dans la room
      io.to(matchId).emit('receive_message', message)

    } catch (error) {
      console.error('Erreur socket send_message:', error)
      socket.emit('error', { message: 'Erreur lors de l\'envoi du message' })
    }
  })

  socket.on('disconnect', () => {
    console.log(`🔌 Utilisateur déconnecté : ${socket.id}`)
  })
})

// Démarrage du serveur
httpServer.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`)
  console.log(`🔌 Socket.io activé`)
})
