import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { NotificationProvider } from './context/NotificationContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import AIPlanner from './pages/AIPlanner'
import Chatbot from './pages/Chatbot'
import Recommendations from './pages/Recommendations'
import Budget from './pages/Budget'
import Weather from './pages/Weather'
import Maps from './pages/Maps'
import Hotels from './pages/Hotels'
import Journey from './pages/Journey'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'

function AppLayout() {
  const location = useLocation()
  const hideFooter = location.pathname === '/chat'

  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-main">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Home />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="planner" element={<AIPlanner />} />
                <Route path="chat" element={<Chatbot />} />
                <Route path="recommendations" element={<Recommendations />} />
                <Route path="budget" element={<Budget />} />
                <Route path="weather" element={<Weather />} />
                <Route path="maps" element={<Maps />} />
                <Route path="hotels" element={<Hotels />} />
                <Route path="journey" element={<Journey />} />
                <Route path="profile" element={<Profile />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
