import { Link } from 'react-router-dom'
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa'
import { HiMail, HiPhone } from 'react-icons/hi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Colonne 1 : Logo et description */}
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <img src="/logo.png" alt="ScholarFlow" className="h-6 w-auto" />
              <span className="text-lg font-bold text-white">ScholarFlow</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Plateforme de gestion de projets étudiants.
            </p>
            {/* Icônes réseaux sociaux */}
            <div className="flex space-x-3 text-xl">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition">
                <FaFacebook />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-500 transition">
                <FaInstagram />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                <FaTwitter />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500 transition">
                <FaYoutube />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition">
                <FaLinkedin />
              </a>
            </div>
          </div>
          
          {/* Colonne 2 : Navigation */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Navigation</h3>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/" className="hover:text-primary transition">Accueil</Link></li>
              <li><Link to="/login" className="hover:text-primary transition">Connexion</Link></li>
              <li><Link to="/register" className="hover:text-primary transition">Inscription</Link></li>
            </ul>
          </div>
          
          {/* Colonne 3 : Téléchargement des applications */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Applications</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-xs hover:text-primary transition font-medium">
                  <span className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center border border-white/10">📱</span>
                  <span>App Store</span>
                </a>
              </li>
              <li>
                <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 text-xs hover:text-primary transition font-medium">
                  <span className="w-6 h-6 bg-white/5 rounded-md flex items-center justify-center border border-white/10">📱</span>
                  <span>Google Play</span>
                </a>
              </li>
            </ul>
          </div>
          
          {/* Colonne 4 : Nous contacter */}
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Nous contacter</h3>
            <p className="text-xs text-gray-400 mb-4 font-medium italic">
              Besoin d'aide ? Notre équipe est à votre disposition.
            </p>
            <div className="space-y-3">
              <a href="mailto:support@scholarflow.com" className="flex items-center space-x-3 text-xs text-primary hover:text-primary/80 transition font-bold">
                <HiMail className="text-lg" />
                <span>support@scholarflow.com</span>
              </a>
              <a href="tel:+237640616140" className="flex items-center space-x-3 text-xs text-gray-400 hover:text-white transition font-medium">
                <HiPhone className="text-lg" />
                <span>+237 6 40 61 61 40</span>
              </a>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Section basse */}
      <div className="border-t border-gray-800 py-3">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="flex space-x-3 mb-2 md:mb-0">
            <Link to="/legal" className="hover:text-gray-300 transition">Confidentialité</Link>
            <span>|</span>
            <Link to="/legal" className="hover:text-gray-300 transition">Conditions</Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <span>🌐</span>
            <select className="bg-transparent text-gray-500 hover:text-gray-300 cursor-pointer outline-none text-xs">
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
          
          <div className="text-xs text-gray-500 mt-2 md:mt-0">
            © 2026 ScholarFlow
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
