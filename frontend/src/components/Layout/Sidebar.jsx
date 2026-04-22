import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, Users, Building, ShieldAlert, TrendingUp, LogOut, Columns } from 'lucide-react'
import { cn } from '../../utils/utils'
import { useAuth } from '../../contexts/AuthContext'

export function Sidebar({ role, isOpen, setIsOpen }) {
  const location = useLocation()
  const { logout } = useAuth()

  const links = [
    { name: 'Accueil', path: '/dashboard', icon: LayoutDashboard },
  ]
  
  if (role === 'creator') {
    links.push(
      { name: 'Utilisateurs', path: '/dashboard/users', icon: Users },
      { name: 'Établissements', path: '/dashboard/etablissements', icon: Building },
      { name: 'Statistiques', path: '/dashboard/statistics', icon: TrendingUp },
      { name: 'Modération', path: '/dashboard/moderation', icon: ShieldAlert }
    )
  }
  if (role === 'etablissement') {
    links.push(
      { name: 'Utilisateurs', path: '/dashboard/users', icon: Users },
      { name: 'Projets', path: '/dashboard/projects', icon: FolderKanban },
      { name: 'Statistiques', path: '/dashboard/statistics', icon: TrendingUp }
    )
  }
  if (role === 'enseignant') {
    links.push(
      { name: 'Annuaire', path: '/dashboard/users', icon: Users },
      { name: 'Projets', path: '/dashboard/projects', icon: FolderKanban }
    )
  }
  if (role === 'etudiant') {
    links.push(
      { name: 'Projets', path: '/dashboard/projects', icon: FolderKanban }
    )
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-white/50 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar flex flex-col h-full transition-all duration-300 md:static md:translate-x-0 border-r border-white/5",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 mb-8 mt-2">
          <Link to="/dashboard" className="flex items-center gap-3 group">
             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/50 transition-all overflow-hidden p-1">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
             </div>
             <div className="flex flex-col">
                <span className="text-white font-black text-base tracking-widest uppercase group-hover:text-primary transition-colors">ScholarFlow</span>
                <span className="text-[10px] text-primary/60 font-bold tracking-[0.2em] uppercase">Espace Travail</span>
             </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary font-semibold shadow-sm" 
                    : "text-sidebar-foreground/60 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground/40")} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="mb-4 px-2 py-3 bg-white/5 rounded-lg border border-white/5">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center">
                   <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs text-white font-medium">Session Active</span>
                   <span className="text-[10px] text-sidebar-foreground/50">En ligne</span>
                </div>
             </div>
          </div>
        </div>
      </aside>
    </>
  )
}
