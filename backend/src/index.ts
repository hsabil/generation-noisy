import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mock database (on utilisera Prisma plus tard)
const users: any[] = [];

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, quartier } = req.body;
    if (!firstName || !lastName || !email || !password || !quartier) {
      return res.status(400).json({ error: 'Champs manquants' });
    }
    const existing = users.find(u => u.email === email);
    if (existing) {
      return res.status(409).json({ error: 'Email déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), firstName, lastName, email, password: hashedPassword, quartier };
    users.push(user);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.status(201).json({ user: { id: user.id, email: user.email, firstName, lastName }, token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, token });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
