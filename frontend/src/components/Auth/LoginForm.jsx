import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { HiMail, HiLockClosed } from 'react-icons/hi'

const LoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()
    
    if (!cleanEmail || !cleanPassword) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }
    
    try {
      await login(cleanEmail, cleanPassword)
      
      // Récupérer le rôle depuis localStorage
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const user = JSON.parse(userStr)
        if (user.role === 'etudiant') {
          navigate('/dashboard')
        } else if (user.role === 'enseignant') {
          navigate('/dashboard')
        } else if (user.role === 'etablissement') {
          navigate('/dashboard')
        } else if (user.role === 'creator') {
          navigate('/dashboard')
        } else {
          navigate('/')
        }
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden w-full">
      {/* En-tête avec logo et nom */}
      {/* En-tête avec logo et nom */}
      <div className="bg-navbar px-6 py-10 text-center border-b border-white/5">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-xl">
            <img src="/logo.png" alt="ScholarFlow" className="h-16 w-auto" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em]">ScholarFlow</h1>
        <p className="text-primary/60 mt-2 text-[10px] font-bold uppercase tracking-widest">Connectez-vous pour continuer</p>
      </div>
      
      {/* Formulaire */}
      <div className="px-8 py-10">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold uppercase tracking-tight flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Champ Email */}
          <div>
            <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">
              Adresse Email
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <HiMail className="text-gray-300 text-lg group-focus-within:text-primary" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="votre@email.com"
              />
            </div>
          </div>
          
          {/* Champ Mot de passe */}
          <div>
            <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">
              Mot de Passe
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                <HiLockClosed className="text-gray-300 text-lg group-focus-within:text-primary" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          {/* Option Mémoriser le mot de passe */}
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 border-2 border-gray-200 rounded-md peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-sm opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
              </div>
              <span className="text-xs text-gray-400 font-bold uppercase tracking-tighter group-hover:text-gray-600 transition-colors">Se souvenir de moi</span>
            </label>
            <a href="#" className="text-[10px] font-bold text-primary uppercase tracking-tighter hover:underline">Oublié ?</a>
          </div>
          
          {/* Bouton Continuer */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transform active:scale-[0.98]"
          >
            {loading ? 'Authentification...' : 'Se Connecter'}
          </button>
        </form>
        
        {/* Lien vers inscription */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Pas encore de compte ?{' '}
          <a href="/register" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
            S'inscrire
          </a>
        </p>
        <div className="mt-4 text-center">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700 hover:opacity-80 transition">
            Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
