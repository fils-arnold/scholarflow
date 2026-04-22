import { useState } from "react";
import Footer from "../components/Layout/Footer";
import Navbar from "../components/Layout/Navbar";

const Home = () => {
  const [email, setEmail] = useState("");

  return (
    <div 
      className="min-h-screen font-sans flex flex-col"
      style={{
        backgroundImage: "url('/scholar.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat"
      }}
    >
      <Navbar />
      {/* Overlay sombre sur toute la page */}
      <div className="flex-1 bg-black/40 flex flex-col">
        
        <main className="flex-grow">
          {/* Section Héro */}
          <div className="relative text-white min-h-[90vh] flex items-center">
            <div className="relative z-10 container mx-auto px-4 py-20 text-center">
              <div className="flex justify-center mb-6">
                <img src="/logo.png" alt="ScholarFlow" className="h-20 w-auto" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-4">ScholarFlow</h1>
              <p className="text-xl md:text-2xl mb-6">
                La plateforme de gestion de projets étudiants
              </p>
              <p className="text-lg mb-8 max-w-2xl mx-auto">
                Connectez étudiants et enseignants pour une collaboration efficace
              </p>
              
              <div className="max-w-md mx-auto mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                    Commencer
                  </button>
                </div>
                <p className="text-xs opacity-70 mt-3">
                  Gratuit • Sans engagement • Accès immédiat
                </p>
              </div>
              
              <div className="flex justify-center space-x-4">
                <a 
                  href="/register" 
                  className="bg-primary text-white px-6 py-3 rounded-lg font-bold uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/30 transform hover:scale-105"
                >
                  S'inscrire gratuitement
                </a>
                <a 
                  href="/login" 
                  className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition"
                >
                  Espace Connecté
                </a>
              </div>
            </div>
          </div>
          
          {/* Section fonctionnalités (fond blanc semi-transparent) */}
          <div className="bg-white/90 backdrop-blur-sm py-20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Pourquoi choisir ScholarFlow ?
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Une solution complète adaptée à tous les acteurs de l'éducation
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-3">Trouvez des projets</h3>
                  <p className="text-gray-600">
                    Accédez à une liste de projets ouverts et postulez facilement en quelques clics
                  </p>
                </div>
                <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="text-5xl mb-4">👥</div>
                  <h3 className="text-xl font-semibold mb-3">Collaborez efficacement</h3>
                  <p className="text-gray-600">
                    Interface type Trello pour un suivi visuel et une collaboration optimale
                  </p>
                </div>
                <div className="text-center p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
                  <div className="text-5xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-3">Suivez vos statistiques</h3>
                  <p className="text-gray-600">
                    Dashboards personnalisés par rôle : étudiant, enseignant, établissement
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section illustration avec projet_management.png */}
          <div className="bg-white/85 backdrop-blur-sm py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="/projet_management.png" 
                    alt="Gestion de projets" 
                    className="rounded-xl shadow-lg w-full"
                    onError={(e) => { e.target.style.display='none' }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Gérez vos projets en toute simplicité
                  </h3>
                  <p className="text-gray-600 mb-4">
                    ScholarFlow vous offre une vue d'ensemble sur tous vos projets.
                    Suivez l'avancement, gérez les candidatures et communiquez facilement.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Création et suivi de projets</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Gestion des candidatures</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Tableaux de bord personnalisés</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section tablette.png */}
          <div className="bg-white/85 backdrop-blur-sm py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Accessible partout, tout le temps
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Que vous soyez sur ordinateur, tablette ou smartphone, 
                    ScholarFlow s'adapte à tous vos écrans pour une expérience optimale.
                  </p>
                  <a href="/register" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-primary/90 transition shadow-lg shadow-primary/20">
                    Commencer maintenant
                  </a>
                </div>
                <div className="order-1 md:order-2">
                  <img 
                    src="/tablette.png" 
                    alt="Accessible sur tablette" 
                    className="rounded-xl shadow-lg w-full"
                    onError={(e) => { e.target.style.display='none' }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Section reunion.png */}
          <div className="bg-white/85 backdrop-blur-sm py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <img 
                    src="/reunion.png" 
                    alt="Travail d'équipe" 
                    className="rounded-xl shadow-lg w-full"
                    onError={(e) => { e.target.style.display='none' }}
                  />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    Collaborez en équipe
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Facilitez la communication entre étudiants et enseignants.
                    Travaillez ensemble sur vos projets et atteignez vos objectifs.
                  </p>
                  <div className="flex space-x-4">
                    <div className="text-center">
                      <div className="text-3xl font-black text-primary">150+</div>
                      <div className="text-sm text-gray-600">Projets</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-primary">1200+</div>
                      <div className="text-sm text-gray-600">Étudiants</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-black text-primary">45+</div>
                      <div className="text-sm text-gray-600">Enseignants</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section avantages */}
          <div className="bg-white/85 backdrop-blur-sm py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow">
                  <div className="text-3xl">🔔</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Notifications en temps réel</h3>
                    <p className="text-gray-600">Restez informé des candidatures et acceptations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow">
                  <div className="text-3xl">🔒</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Sécurisé</h3>
                    <p className="text-gray-600">Authentification JWT et données protégées</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow">
                  <div className="text-3xl">📱</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Accessible partout</h3>
                    <p className="text-gray-600">Interface responsive sur tous les appareils</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section statistiques */}
          <div className="bg-gradient-to-r from-primary/90 to-primary/70 backdrop-blur-sm py-20">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div className="text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">150+</div>
                  <div className="text-blue-100">Projets actifs</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">1200+</div>
                  <div className="text-blue-100">Étudiants inscrits</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">45+</div>
                  <div className="text-blue-100">Enseignants</div>
                </div>
                <div className="text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">89+</div>
                  <div className="text-blue-100">Projets complétés</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section témoignage */}
          <div className="bg-white/85 backdrop-blur-sm py-20">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <div className="text-6xl mb-4">⭐</div>
                <p className="text-xl md:text-2xl text-gray-700 italic mb-6">
                  "ScholarFlow a révolutionné la gestion de nos projets étudiants. 
                  Une interface intuitive et des fonctionnalités parfaitement adaptées."
                </p>
                <p className="font-semibold text-gray-800">— Dr. Mbarga, Université de Douala</p>
              </div>
            </div>
          </div>
          
          {/* Section CTA finale */}
          <div className="bg-gradient-to-r from-primary/90 to-primary/70 backdrop-blur-sm py-16">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Prêt à rejoindre l'aventure ?
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers d'étudiants et d'enseignants qui utilisent déjà ScholarFlow
              </p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="/register" 
                  className="bg-white text-primary px-8 py-3 rounded-lg font-black uppercase tracking-[0.2em] hover:bg-gray-100 transition shadow-lg"
                >
                  Créer un compte gratuit
                </a>
                <a 
                  href="/login" 
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Espace Connecté
                </a>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  )
}

export default Home
