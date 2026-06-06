import { Navigate, Route, Routes } from 'react-router-dom'

import AppShell from './components/AppShell.jsx'
import { useAuth } from './context/AuthContext.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import ReportDetailPage from './pages/ReportDetailPage.jsx'
import ReportsPage from './pages/ReportsPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import UploadPage from './pages/UploadPage.jsx'

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { bootstrapping, isAuthenticated } = useAuth()

  if (bootstrapping) {
    return <LoadingScreen />
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function PublicRoute({ children }) {
  const { bootstrapping, isAuthenticated } = useAuth()

  if (bootstrapping) {
    return <LoadingScreen />
  }

  return isAuthenticated ? <Navigate to="/app/dashboard" replace /> : children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="upload" element={<UploadPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="reports/:id" element={<ReportDetailPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="admin" element={<AdminPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
    </Routes>
  )
}

export default App
