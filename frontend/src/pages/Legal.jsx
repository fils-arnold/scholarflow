import React, { useState, useEffect } from 'react';
import { ShieldCheck, GraduationCap, Building, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function Legal() {
  const [user, setUser] = useState(null);
  const [etablissement, setEtablissement] = useState(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const u = JSON.parse(userStr);
      setUser(u);
      if (u.etablissement_id) {
        fetchEtablissement(u.etablissement_id);
      }
    }
  }, []);

  const fetchEtablissement = async (id) => {
    try {
      const response = await api.get(`/etablissements/${id}`);
      setEtablissement(response.data);
    } catch (err) {
      console.error("Erreur lors de la récupération de l'établissement");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        <header className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Cadre Légal & Conditions d'Utilisation
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            ScholarFlow garantit la transparence entre le Super Admin, les Établissements et les Utilisateurs.
          </p>
        </header>

        {/* SECTION 1: GLOBAL ADMIN TOU */}
        <section className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-blue-600">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-8 h-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Règles Globales (Super Admin)</h2>
            </div>
            
            <div className="prose prose-blue max-w-none text-gray-600 space-y-6">
              <p className="font-semibold text-gray-800 italic bg-blue-50 p-4 rounded-lg">
                "Ces conditions s'appliquent à l'ensemble de la plateforme et sont acceptées par tout établissement rejoignant ScholarFlow."
              </p>

              <h3 className="text-lg font-bold text-gray-800">1. Fraudes Système & Sécurité</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Interdiction de toute tentative de piratage, injection de code ou perturbation du service.</li>
                <li>L'usurpation d'identité globale ou la création de faux établissements entraîne un bannissement immédiat.</li>
                <li>Le Super Admin gère exclusivement les violations liées à l'intégrité de la plateforme (Fraudes Globales).</li>
              </ul>

              <h3 className="text-lg font-bold text-gray-800">2. Respect des Données</h3>
              <p>ScholarFlow s'engage à protéger les données personnelles conformément au RGPD. Toute exploitation illégale des données de la plateforme est une fraude globale.</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: ESTABLISHMENT TOU - Hidden for Super Admin */}
        {user?.role !== 'creator' && (
          <section className="bg-white shadow-xl rounded-2xl overflow-hidden border-t-4 border-green-600">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                  <Building className="w-8 h-8 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">Conditions de l'Établissement</h2>
              </div>
              
              <div className="prose prose-green max-w-none text-gray-600 space-y-6">
                {etablissement ? (
                  <>
                    <p className="bg-green-50 p-4 rounded-lg font-medium text-green-800">
                      Règles spécifiques pour : <span className="font-bold">{etablissement.nom}</span>
                    </p>
                    <div className="whitespace-pre-wrap">
                      {etablissement.terms_of_use || "Cet établissement n'a pas encore défini de conditions spécifiques. Les règles standards s'appliquent."}
                    </div>
                  </>
                ) : (
                  <p className="italic text-gray-400 text-center py-4 border-2 border-dashed rounded-xl">
                    {user ? "Aucun établissement affilié détecté." : "Connectez-vous pour consulter les conditions spécifiques à votre établissement."}
                  </p>
                )}

                <h3 className="text-lg font-bold text-gray-800">Hiérarchie et Conformité</h3>
                <p className="text-sm border-l-4 border-amber-500 pl-4 bg-amber-50 py-2">
                  <strong>Note importante :</strong> Les conditions définies par l'établissement ne peuvent en aucun cas déroger ou contredire les règles globales fixées par le Super Admin. En cas de conflit, les règles globales prévalent.
                </p>

                <h3 className="text-lg font-bold text-gray-800">Règles Standards</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Respect de l'assiduité et des délais fixés pour les projets.</li>
                  <li>Honnêteté académique (Pas de plagiat).</li>
                  <li>L'établissement est souverain pour gérer les conflits internes et les violations pédagogiques (Fraudes Locales).</li>
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: ACCEPTANCE NOTICE */}
        <section className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 flex gap-4 items-start">
            <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
            <div>
                <h3 className="text-lg font-bold text-amber-900">Information Importante sur l'Acceptation</h3>
                <p className="text-amber-800 text-sm mt-1">
                    En vous inscrivant à un établissement sur ScholarFlow, vous acceptez explicitement les conditions de cet établissement. 
                    L'établissement ayant lui-même accepté les conditions du Super Admin, ces dernières s'appliquent de facto à tous ses membres et doivent être scrupuleusement respectées.
                </p>
            </div>
        </section>

        <footer className="text-center text-gray-400 text-sm pb-10">
          Dernière mise à jour : Avril 2026 • ScholarFlow Legal Services
        </footer>
      </div>
    </div>
  );
}
