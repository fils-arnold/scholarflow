import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const RegisterForm = () => {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'etudiant',
    etablissement_nom: '',
    matricule: '',
    qualification: '',
    grade: '',
    expertise: '',
    nom_etablissement: '',
    num_arrete_creation: '',
    type_etablissement: '',
    statut_juridique: '',
    adresse_etablissement: '',
    telephone_etablissement: ''
  })
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validation des champs obligatoires
    if (!formData.email || !formData.password || !formData.nom || !formData.prenom) {
      setError('Veuillez remplir tous les champs obligatoires')
      setLoading(false)
      return
    }

    if (!acceptedTerms) {
      setError('Vous devez accepter les conditions d\'utilisation')
      setLoading(false)
      return
    }

    try {
      // Préparer les données selon le rôle
      const userData = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        role: formData.role
      }

      // Ajouter les champs spécifiques selon le rôle
      if (formData.role === 'etablissement') {
        userData.nom_etablissement = formData.nom_etablissement
        userData.num_arrete_creation = formData.num_arrete_creation
        userData.type_etablissement = formData.type_etablissement
        userData.statut_juridique = formData.statut_juridique
        userData.adresse_etablissement = formData.adresse_etablissement
        userData.telephone_etablissement = formData.telephone_etablissement
      } else if (formData.role === 'enseignant' || formData.role === 'etudiant') {
        userData.etablissement_nom = formData.etablissement_nom
        userData.matricule = formData.matricule
        if (formData.role === 'enseignant') {
          userData.qualification = formData.qualification
          userData.grade = formData.grade
          userData.expertise = formData.expertise
        }
      }

      await register(userData)
      
      // Rediriger vers le dashboard correspondant
      if (formData.role === 'etudiant') {
        navigate('/login')
      } else if (formData.role === 'enseignant') {
        navigate('/login')
      } else if (formData.role === 'etablissement') {
        navigate('/login')
      } else {
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden w-full">
      {/* En-tête */}
      {/* En-tête */}
      <div className="bg-navbar px-6 py-8 text-center border-b border-white/5">
        <div className="flex justify-center mb-4">
          <div className="p-2 bg-white/5 rounded-xl border border-white/10 shadow-lg">
            <img src="/logo.png" alt="ScholarFlow" className="h-10 w-auto" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white uppercase tracking-[0.2em]">ScholarFlow</h1>
        <p className="text-primary/60 mt-2 text-[10px] font-bold uppercase tracking-widest">Créez votre compte professionnel</p>
      </div>
      
      {/* Formulaire */}
      <div className="px-8 py-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Rôle */}
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Je suis</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
            >
              <option value="etudiant">Étudiant</option>
              <option value="enseignant">Enseignant</option>
              <option value="etablissement">Établissement</option>
            </select>
          </div>
          
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Nom</label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                placeholder="Dupont"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Prénom</label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
                placeholder="Jean"
                required
              />
            </div>
          </div>
          
          {/* Email */}
          <div className="mb-6">
            <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
              placeholder="exemple@email.com"
              required
            />
          </div>
          
          {/* Mot de passe */}
          <div className="mb-6">
            <label className="block text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2 px-1">Mot de passe</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-medium transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          {/* Établissement (étudiant/enseignant) */}
          {(formData.role === 'etudiant' || formData.role === 'enseignant') && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Établissement</label>
              <input
                type="text"
                name="etablissement_nom"
                value={formData.etablissement_nom}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nom de l'établissement"
              />
            </div>
          )}
          
          {/* Matricule (étudiant/enseignant) */}
          {(formData.role === 'etudiant' || formData.role === 'enseignant') && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Matricule</label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Matricule"
              />
            </div>
          )}
          
          {/* Qualification, Grade, Expertise (enseignant uniquement) */}
          {formData.role === 'enseignant' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Qualification</label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Maître de conférences"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="CAMES"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Expertise</label>
                <input
                  type="text"
                  name="expertise"
                  value={formData.expertise}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Domaine d'expertise"
                />
              </div>
            </>
          )}
          
          {/* Champs pour établissement */}
          {formData.role === 'etablissement' && (
            <>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Nom de l'établissement</label>
                <input
                  type="text"
                  name="nom_etablissement"
                  value={formData.nom_etablissement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Université de Douala"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">N° Arrêté création</label>
                <input
                  type="text"
                  name="num_arrete_creation"
                  value={formData.num_arrete_creation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2025/001"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Type d'établissement</label>
                <input
                  type="text"
                  name="type_etablissement"
                  value={formData.type_etablissement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Université"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Statut juridique</label>
                <select
                  name="statut_juridique"
                  value={formData.statut_juridique}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  <option value="Public">Public</option>
                  <option value="Privé laïc">Privé laïc</option>
                  <option value="Privé confessionnel">Privé confessionnel</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Adresse</label>
                <input
                  type="text"
                  name="adresse_etablissement"
                  value={formData.adresse_etablissement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Adresse"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Téléphone</label>
                <input
                  type="text"
                  name="telephone_etablissement"
                  value={formData.telephone_etablissement}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="+237 6 12 34 56 78"
                />
              </div>
            </>
          )}
          
          {/* Case à cocher Conditions d'utilisation */}
          <div className="mt-8 mb-6">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="w-5 h-5 text-primary border-gray-200 rounded focus:ring-primary transition cursor-pointer"
              />
              <span className="text-xs text-gray-500 group-hover:text-gray-900 transition font-medium italic">
                J'accepte les <a href="/legal" target="_blank" className="text-primary hover:underline font-bold">
                  {formData.role === 'etablissement' 
                    ? "conditions d'utilisation" 
                    : "conditions d'utilisation de l'établissement"}
                </a>
              </span>
            </label>
          </div>
          
          {/* Bouton */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-primary/20 mt-4 disabled:opacity-50 disabled:shadow-none transform active:scale-[0.98]"
          >
            {loading ? 'Création du compte...' : 'Finaliser l\'Inscription'}
          </button>
        </form>
        
        <p className="text-center text-gray-600 text-sm mt-6">
          Déjà un compte ? <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Se connecter</a>
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

export default RegisterForm
