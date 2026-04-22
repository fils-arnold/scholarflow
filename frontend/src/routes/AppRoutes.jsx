import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from '../pages/Home'
import Login from '../pages/Login'
import Register from '../pages/Register'
import { Layout } from '../components/Layout/Layout'
import Dashboard from '../pages/Dashboard'
import { ProjectsList } from '../pages/ProjectsList'
import { ProjectDetail } from '../pages/ProjectDetail'
import { UsersList } from '../pages/UsersList'
import CreatorPortal from '../pages/CreatorPortal'
import { EtablissementsList } from '../pages/EtablissementsList'
import { Profile } from '../pages/Profile'
import Legal from '../pages/Legal'
import Moderation from '../pages/Moderation'
import Statistics from '../pages/Statistics'
import NotFound from '../pages/NotFound'
import { useAuth } from '../contexts/AuthContext'

export function AppRoutes() {
  const { user } = useAuth()
  const isStudent = user?.role === 'etudiant'

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/portail-createur" element={<CreatorPortal />} />
      <Route path="/legal" element={<Legal />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="projects" element={<ProjectsList />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="users" element={!isStudent ? <UsersList /> : <Navigate to="/dashboard" replace />} />
        <Route path="etablissements" element={<EtablissementsList />} />
        <Route path="moderation" element={<Moderation />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
