import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, quartier } = req.body;
    // TODO: Ajouter logique Prisma plus tard
    res.status(201).json({ 
      user: { id: 'temp-id', email, firstName, lastName }, 
      token: 'temp-token-' + Date.now() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    res.json({ 
      user: { id: 'temp-id', email }, 
      token: 'temp-token-' + Date.now() 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
