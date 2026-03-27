export type UserRole = 'MEMBER' | 'COORDINATOR' | 'SUPER_ADMIN'

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  quartier: string
  bio?: string
  avatar?: string
  credits: number
  role: UserRole
  createdAt: string
}

export type ServiceCategory =
  | 'BRICOLAGE'
  | 'INFORMATIQUE'
  | 'COURS'
  | 'GARDE_ENFANTS'
  | 'TRANSPORT'
  | 'ADMINISTRATIF'
  | 'COACHING'
  | 'SANTE_BIENETRE'
  | 'CUISINE'
  | 'AUTRE'

export type Service = {
  id: string
  title: string
  description: string
  type: 'OFFER' | 'REQUEST'
  category: ServiceCategory
  credits: number
  quartier: string
  status: 'ACTIVE' | 'MATCHED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED'
  expiresAt: string
  createdAt: string
  author: {
    id: string
    firstName: string
    lastName: string
    quartier: string
    avatar?: string
    credits: number
  }
}

export type Match = {
  id: string
  status: 'PROPOSED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'
  message?: string
  createdAt: string
  service: Service
  seeker: Partial<User>
  helper: Partial<User>
  rating?: Rating
}

export type Rating = {
  id: string
  score: number
  comment?: string
  createdAt: string
  giver: Partial<User>
  receiver: Partial<User>
}

export type Notification = {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const QUARTIERS = [
  'Le Centre',
  'Les Richardets',
  'Les Yvris',
  'Le Bois Saint Martin',
  'Le Montfort',
  'Le Pavé Neuf',
  "Le Mont d'Est",
  'La Varenne',
  'La Rive Charmante',
  'La Rive de Marne',
  'Les Cormiers',
  'Les Hauts Batons',
  'Le Champy',
  'Le Marnois',
  'La Butte Verte',
]

export const CATEGORIES: { value: ServiceCategory; label: string; emoji: string }[] = [
  { value: 'BRICOLAGE', label: 'Bricolage', emoji: '🔧' },
  { value: 'INFORMATIQUE', label: 'Informatique', emoji: '💻' },
  { value: 'COURS', label: 'Cours & Devoirs', emoji: '📚' },
  { value: 'GARDE_ENFANTS', label: "Garde d'enfants", emoji: '👶' },
  { value: 'TRANSPORT', label: 'Transport', emoji: '🚗' },
  { value: 'ADMINISTRATIF', label: 'Administratif', emoji: '📋' },
  { value: 'COACHING', label: 'Coaching & Mentorat', emoji: '🎯' },
  { value: 'SANTE_BIENETRE', label: 'Santé & Bien-être', emoji: '❤️' },
  { value: 'CUISINE', label: 'Cuisine', emoji: '🍳' },
  { value: 'AUTRE', label: 'Autre', emoji: '✨' },
]
