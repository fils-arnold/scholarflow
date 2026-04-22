import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, LogIn, Lock, Mail } from 'lucide-react';
import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export default function CreatorPortal() {
  const [email, setEmail] = useState('createur@scholarflow.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Bienvenue, Créateur');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Identifiants administrateur incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="relative w-full max-w-md z-10">
        <div className="text-center mb-8">
            <div className="h-20 w-20 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/30 shadow-[0_0_50px_-12px_rgba(37,99,235,0.5)]">
                <ShieldAlert className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Portail Créateur</h1>
            <p className="text-blue-200/60">Accès ultra-sécurisé réservé à l'administration racine de ScholarFlow.</p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Identifiant Maître</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input 
                  type="email" 
                  value={email}
                  disabled
                  className="pl-10 bg-slate-800/50 border-slate-700 text-slate-300 opacity-70 cursor-not-allowed h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">Clé d'accès secrète</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <Input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="pl-10 bg-slate-800/80 border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/50 h-12"
                />
              </div>
            </div>

            <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] transition-all"
            >
              {isLoading ? (
                  <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authentification...
                  </span>
              ) : (
                  <span className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" /> Entrer dans le système
                  </span>
              )}
            </Button>
          </form>
        </div>
        
        <p className="text-center text-xs text-slate-600 mt-8">
            Toute tentative d'accès non autorisée à ce portail est enregistrée.
        </p>
      </div>
    </div>
  );
}
