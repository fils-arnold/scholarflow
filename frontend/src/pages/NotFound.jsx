import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '../components/Common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-bounce">
        <AlertCircle className="w-12 h-12 text-primary" />
      </div>
      
      <h1 className="text-6xl font-black text-slate-900 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-4 uppercase tracking-widest">Page Introuvable</h2>
      
      <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
        Désolé, la page que vous recherchez semble avoir disparu dans les méandres du flux académique.
      </p>

      <Button 
        onClick={() => navigate('/dashboard')}
        className="rounded-2xl px-8 py-6 shadow-xl shadow-primary/20"
      >
        <Home className="w-5 h-5 mr-2" />
        Retour au Tableau de Bord
      </Button>
      
      <div className="mt-12 opacity-20 select-none pointer-events-none">
        <span className="text-8xl font-black uppercase tracking-tighter">ScholarFlow</span>
      </div>
    </div>
  );
}
