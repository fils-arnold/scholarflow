// components/Layout/Navbar.jsx
import NotificationBell from '../Common/NotificationBell'

const Navbar = ({ user, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 bg-navbar border-b border-white/5 text-white h-20 flex items-center shadow-lg">
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo à gauche */}
        <a href="/" className="flex items-center gap-4 group">
          <div className="bg-white/10 p-2 rounded-xl border border-white/10 group-hover:border-primary/50 transition-all shadow-xl">
            <img src="/logo.png" alt="ScholarFlow" className="h-10 w-auto object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-[0.1em] text-white uppercase group-hover:text-primary transition-colors">ScholarFlow</span>
            <span className="text-[10px] text-primary/80 font-bold uppercase tracking-widest leading-none">Collaborative platform</span>
          </div>
        </a>
        
        {/* Liens de navigation poussés à droite */}
        <div className="flex space-x-8 items-center">
          {user ? (
            <>
              <div className="flex flex-col items-end mr-4">
                <a href="/dashboard/profile" className="text-sm font-bold text-white hover:text-primary transition-colors">
                  {(user.prenom || '').toLowerCase()} {(user.nom || '').toUpperCase()}
                </a>
                <span className="text-[10px] text-primary/60 uppercase font-black tracking-tighter mt-1">{user.role}</span>
              </div>
              <button 
                onClick={onLogout}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-primary/20"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <div className="flex items-center gap-6">
              <a href="/login" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Connexion</a>
              <a 
                href="/register" 
                className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-primary/30 transform hover:scale-105 active:scale-95"
              >
                Inscription
              </a>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
