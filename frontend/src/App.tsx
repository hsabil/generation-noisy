import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Feed } from './pages/Feed'
import { CreateService } from './pages/CreateService'
import { ServiceDetail } from './pages/ServiceDetail'
import { MyMatches } from './pages/MyMatches'
import { Chat } from './pages/Chat'
import { Profile } from './pages/Profile'
import { Notifications } from './pages/Notifications'
import { AdminDashboard } from './pages/AdminDashboard'
import { MyServices } from './pages/MyServices'

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Chargement...</div>
  return user ? <>{children}</> : <Navigate to="/login" />
}

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return <div>Chargement...</div>
  if (!user) return <Navigate to="/login" />
  if (user.role !== 'SUPER_ADMIN' && user.role !== 'COORDINATOR') return <Navigate to="/dashboard" />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
      <Route path="/create-service" element={<PrivateRoute><CreateService /></PrivateRoute>} />
      <Route path="/services/:id" element={<PrivateRoute><ServiceDetail /></PrivateRoute>} />
      <Route path="/my-matches" element={<PrivateRoute><MyMatches /></PrivateRoute>} />
      <Route path="/chat/:matchId" element={<PrivateRoute><Chat /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
      <Route path="/my-services" element={<PrivateRoute><MyServices /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
