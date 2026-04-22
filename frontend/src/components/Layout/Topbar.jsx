import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell as BellIcon, Search as SearchIcon, Menu as MenuIcon, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate('/');
  };

  const handleNotifications = () => {
    toast.info("Vous n'avez aucune nouvelle notification pour le moment.", {
        description: "Les nouvelles notifications apparaîtront ici."
    });
  };

  // Obtenir les initiales
  const getInitials = () => {
    if (!user) return '??';
    if (user.role === 'etablissement' && user.nom_etablissement) {
        return user.nom_etablissement.substring(0, 2).toUpperCase();
    }
    const n = user.nom ? user.nom[0] : '';
    const p = user.prenom ? user.prenom[0] : '';
    return (p + n).toUpperCase() || 'U';
  };

  // Nom complet à afficher
  const getDisplayName = () => {
    if (!user) return 'Utilisateur';
    if (user.role === 'etablissement' && user.nom_etablissement) {
        return user.nom_etablissement.toUpperCase();
    }
    const prenom = (user.prenom || '').toLowerCase();
    const nom = (user.nom || '').toUpperCase();
    return `${prenom} ${nom}`.trim();
  };

  // Formater le rôle
  const getRoleDisplay = () => {
    if (!user) return '';
    const roles = {
        'creator': 'Créateur / Admin',
        'etablissement': 'Établissement',
        'enseignant': 'Enseignant',
        'etudiant': 'Étudiant'
    };
    return roles[user.role] || user.role;
  };

  return (
    <header className="h-16 bg-navbar text-white border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-white/70 hover:text-white p-1 -ml-1 rounded-md transition-colors hover:bg-white/5"
        >
          <MenuIcon className="w-5 h-5" />
        </button>

        <div className="flex md:hidden items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            <span className="font-black text-xs uppercase tracking-widest">ScholarFlow</span>
        </div>
        
        <div className="relative max-w-md w-full hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Rechercher..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-white placeholder:text-white/20"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button 
          onClick={handleNotifications}
          className="relative p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
        >
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-navbar animate-pulse"></span>
        </button>
        
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 hover:bg-white/5 p-1 px-2 rounded-lg transition-all"
          >
            <div className="hidden md:flex flex-col items-end text-sm">
                <span className="font-bold text-white leading-none">{getDisplayName()}</span>
                <span className="text-[10px] text-primary font-black uppercase tracking-tighter mt-1">{getRoleDisplay()}</span>
            </div>
            <div className="relative h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
              {user?.photo_url ? (
                  <img src={user.photo_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                  getInitials()
              )}
            </div>
          </button>

          <button 
            onClick={handleLogout}
            className="hidden sm:flex bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20 items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>

          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowDropdown(false)}
              ></div>
              <div className="absolute right-0 mt-16 w-64 bg-sidebar border border-white/10 rounded-xl shadow-2xl z-50 py-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-white/5 mb-2 bg-white/5">
                    <p className="font-bold text-white truncate">{getDisplayName()}</p>
                    <p className="text-xs text-white/40 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={() => { setShowDropdown(false); navigate('/dashboard/profile'); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-3"
                >
                  <UserIcon className="w-4 h-4 text-primary" /> Mon Profil
                </button>
                <div className="px-2 mt-2 pt-2 border-t border-white/5 sm:hidden">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-center py-2.5 rounded-lg text-sm bg-primary text-white font-bold transition-colors"
                    >
                      Déconnexion
                    </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
