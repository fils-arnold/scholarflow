import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Users, Calendar, Briefcase, Trash2, Edit, 
  CheckCircle, XCircle, Crown, Check, X, UserMinus, 
  Send, FileText, Clock, CheckCircle2, MoreHorizontal,
  Mail, MessageSquare, ShieldCheck, Award
} from 'lucide-react'
import { Button } from '../components/Common/Button'
import { Badge } from '../components/Common/Badge'
import { Modal } from '../components/Common/Modal'
import { TaskBoard } from '../components/Projects/TaskBoard'
import { Certificate } from '../components/Projects/Certificate'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import { toast } from 'sonner'

export function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('details') // 'details', 'board', 'members', 'chat', 'docs'
  const [studentApplication, setStudentApplication] = useState(null)
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)
  const [motivationLetter, setMotivationLetter] = useState('')
  const [isApplying, setIsApplying] = useState(false)
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false)
  const [aiMatches, setAiMatches] = useState([])
  const [allTeachers, setAllTeachers] = useState([])
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editData, setEditData] = useState(null)

  const fetchProjectAndApps = async () => {
    try {
      const { data: projectData } = await api.get(`/projects/${id}`)
      setProject(projectData)
      
      const isAuthorOrAdmin = user && (user.id === projectData.creator_id || user.role === 'etablissement');
      if (isAuthorOrAdmin) {
        const { data: appsData } = await api.get(`/applications/project/${id}`)
        setApplications(appsData)
      }
      
      if (user?.role === 'etudiant') {
        const { data: myApps } = await api.get('/applications/')
        const appForThisProject = myApps.find(a => a.project_id === parseInt(id))
        if (appForThisProject) {
            setStudentApplication(appForThisProject)
        }
      }

      if (isAuthorOrAdmin) {
        try {
          const { data: matches } = await api.get(`/analytics/match/${id}`)
          setAiMatches(matches)
        } catch(e) { console.error("AI Match failed", e) }
        
        // Fetch all teachers for invitation
        try {
          const { data: usersData } = await api.get('/users/')
          setAllTeachers(usersData.filter(u => u.role === 'enseignant' && u.id != user?.id && !u.is_deleted))
        } catch(e) { console.error("Failed to fetch teachers", e) }
      }
    } catch (error) {
      console.error("Error fetching project details", error)
      toast.error("Erreur lors du chargement")
      if (!project) navigate('/dashboard/projects')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjectAndApps()
  }, [id, navigate, user])

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
      try {
        await api.delete(`/projects/${id}`)
        toast.success("Projet supprimé")
        navigate('/dashboard/projects')
      } catch (error) {
        toast.error("Erreur lors de la suppression")
      }
    }
  }

  const handleUpdateApplication = async (appId, newStatus) => {
    try {
        await api.put(`/applications/${appId}`, { status: newStatus });
        toast.success(`Candidature ${newStatus === 'accepted' ? 'acceptée' : 'refusée'}`);
        fetchProjectAndApps();
    } catch (error) {
        toast.error("Erreur lors de la mise à jour de la candidature");
    }
  }

  const handleToggleCollaborator = async (teacherId, isInvited) => {
    try {
        if (isInvited) {
            await api.delete(`/projects/${id}/collaborators/${teacherId}`);
            toast.success("Enseignant retiré du projet");
        } else {
            await api.post(`/projects/${id}/collaborators/${teacherId}`);
            toast.success("Enseignant invité sur le projet");
        }
        fetchProjectAndApps();
    } catch (error) {
        toast.error("Erreur lors de la mise à jour des collaborateurs");
    }
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
        await api.put(`/projects/${id}`, editData);
        toast.success("Projet mis à jour !");
        setIsEditModalOpen(false);
        fetchProjectAndApps();
    } catch (error) {
        toast.error("Erreur lors de la mise à jour du projet");
    }
  }

  if (isLoading) return <div className="p-8 text-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div></div>
  if (!project) return null

  const isAuthor = user && user.id === project.creator_id;
  const isAdmin = user && (user.role === 'etablissement' || user.role === 'creator');
  const isAuthorOrAdmin = isAuthor || isAdmin;
  const isAcceptedMember = studentApplication?.status === 'accepted' || isAuthorOrAdmin;
  const acceptedMembers = applications.filter(a => a.status === 'accepted').map(a => a.student);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => navigate(-1)} 
              className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
                <div className="p-2 rounded-full group-hover:bg-primary/10 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                Retour aux projets
            </button>
            {isAuthor && (
                <div className="flex gap-3">
                    {project.status !== 'completed' && (
                        <Button 
                            variant="success" 
                            size="sm" 
                            className="rounded-xl bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-100"
                            onClick={async () => {
                                if (window.confirm("Voulez-vous clôturer ce projet et certifier les membres ?")) {
                                    try {
                                        await api.put(`/projects/${id}`, { status: 'completed' });
                                        toast.success("Projet clôturé ! Les membres peuvent maintenant télécharger leurs certificats.");
                                        fetchProjectAndApps();
                                    } catch(e) { toast.error("Erreur lors de la clôture."); }
                                }
                            }}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Clôturer & Certifier
                        </Button>
                    )}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={() => {
                            setEditData({
                                title: project.title,
                                description: project.description,
                                domain: project.domain,
                                spots: project.spots,
                                deadline: project.deadline ? project.deadline.split('T')[0] : ''
                            });
                            setIsEditModalOpen(true);
                        }}
                    >
                        <Edit className="mr-2 h-4 w-4" /> Modifier
                    </Button>
                    <Button variant="destructive" size="sm" className="rounded-xl" onClick={handleDelete}><Trash2 className="mr-2 h-4 w-4" /> Supprimer</Button>
                </div>
            )}
        </div>

        <div className="flex flex-col lg:flex-row justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={project.status === 'open' ? 'success' : 'secondary'} className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
                {project.status === 'open' ? 'Recrutement Ouvert' : 'Projet Clos'}
              </Badge>
              <Badge variant="outline" className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border-primary/20 text-primary bg-primary/5">
                {project.domain}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
            <p className="text-sm text-slate-500">Par {(project.creator?.prenom || '').toLowerCase()} {(project.creator?.nom || '').toUpperCase()}</p>
            <div className="bg-white border p-6 rounded-lg text-slate-600 leading-relaxed text-sm">
              {project.description}
            </div>
          </div>
          
          <div className="lg:w-80 space-y-4">
            {user?.role === 'etudiant' && project.status === 'open' && !studentApplication && (
              <button 
                onClick={() => setIsApplyModalOpen(true)}
                className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-primary border border-transparent rounded-2xl hover:bg-primary/90 shadow-xl hover:shadow-primary/30 hover:-translate-y-1"
              >
                <Send className="w-5 h-5 mr-2 -ml-1 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                Postuler maintenant
              </button>
            )}

            {project.status === 'completed' && isAcceptedMember && user?.role === 'etudiant' && (
              <button 
                onClick={() => setIsCertificateModalOpen(true)}
                className="w-full group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white transition-all duration-300 bg-gradient-to-r from-amber-500 to-amber-600 border border-transparent rounded-2xl hover:from-amber-600 hover:to-amber-700 shadow-xl shadow-amber-200 hover:-translate-y-1"
              >
                <Award className="w-5 h-5 mr-2 animate-bounce" />
                Obtenir mon Certificat
              </button>
            )}
            {user?.role === 'etudiant' && studentApplication && (
               <div className={`flex flex-col items-center gap-3 p-6 rounded-2xl font-bold border transition-all shadow-sm ${
                  studentApplication.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-200 shadow-green-100' : 
                  studentApplication.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200 shadow-red-100' : 
                  'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100'
               }`}>
                   <div className={`p-3 rounded-full ${
                     studentApplication.status === 'accepted' ? 'bg-green-500/10' : 
                     studentApplication.status === 'rejected' ? 'bg-red-500/10' : 
                     'bg-amber-500/10'
                   }`}>
                     {studentApplication.status === 'accepted' && <CheckCircle2 className="w-8 h-8" />}
                     {studentApplication.status === 'rejected' && <XCircle className="w-8 h-8" />}
                     {studentApplication.status === 'pending' && <Clock className="w-8 h-8 animate-spin-slow" />}
                   </div>
                   <div className="text-center">
                     <p className="text-xs uppercase tracking-widest opacity-70">Statut de votre demande</p>
                     <p className="text-lg">
                        {studentApplication.status === 'accepted' ? 'Candidature Acceptée' : 
                         studentApplication.status === 'rejected' ? 'Candidature Refusée' : 
                         'Dossier en Attente'}
                     </p>
                   </div>
               </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Places</p>
                  <p className="text-sm font-bold">{project.spots_remaining} / {project.spots}</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                <div className="p-2 bg-white rounded-lg shadow-sm text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400">Deadline</p>
                  <p className="text-sm font-bold">{new Date(project.deadline).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu Simple */}
      <div className="flex items-center gap-6 border-b">
        <button 
          className={`py-3 text-sm font-medium transition-all relative ${activeTab === 'details' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          onClick={() => setActiveTab('details')}
        >
          Détails
        </button>

        {isAcceptedMember && (
          <>
            <button 
              className={`py-3 text-sm font-bold tracking-widest transition-all relative ${activeTab === 'board' ? 'text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
              onClick={() => setActiveTab('board')}
            >
              tâches
            </button>
          </>
        )}

        {isAuthorOrAdmin && (
          <button 
            className={`py-3 text-sm font-medium transition-all relative ${activeTab === 'members' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            onClick={() => setActiveTab('members')}
          >
            Membres
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-500">
        {activeTab === 'details' && (
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-in fade-in duration-500">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary" />
              Description Détaillée
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {activeTab === 'board' && isAcceptedMember && (
          <TaskBoard projectId={project.id} userRole={user?.role} acceptedMembers={acceptedMembers} isCreator={isAuthor} />
        )}

        {isAuthorOrAdmin && activeTab === 'members' && (
          <div className="space-y-10 animate-in fade-in duration-500">
             
             {/* Section Candidatures */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Candidatures à traiter</h3>
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {applications.filter(a => a.status === 'pending').length}
                    </span>
                </div>

                <div className="space-y-2">
                    {applications.filter(a => a.status === 'pending').length === 0 ? (
                        <p className="text-sm text-slate-400 italic py-4">Aucune candidature en attente.</p>
                    ) : (
                        applications.filter(a => a.status === 'pending').map(app => {
                            const match = aiMatches.find(m => m.application_id === app.id);
                            return (
                                <div key={app.id} className="bg-white border border-slate-100 p-5 rounded-lg hover:border-blue-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-900">{(app.student?.prenom || '').toLowerCase()} {(app.student?.nom || '').toUpperCase()}</span>
                                            {match && (
                                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                                                    Score IA : {match.score}%
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded border-l-2 border-blue-400 italic">
                                            "{app.motivation_letter}"
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleUpdateApplication(app.id, 'accepted')}
                                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                                        >
                                            Accepter
                                        </button>
                                        <button 
                                            onClick={() => handleUpdateApplication(app.id, 'rejected')}
                                            className="px-4 py-2 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                                        >
                                            Refuser
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
             </div>

             {/* Section Équipe */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 border-b pb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Équipe du projet</h3>
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {applications.filter(a => a.status === 'accepted').length}
                    </span>
                </div>

                <div className="bg-white border border-slate-100 rounded-lg overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <tbody className="divide-y divide-slate-100">
                            {applications.filter(a => a.status === 'accepted').length === 0 ? (
                                <tr><td className="px-6 py-8 text-slate-400 italic">L'équipe est vide.</td></tr>
                            ) : (
                                applications.filter(a => a.status === 'accepted').map(app => (
                                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                                                    {app.student?.prenom?.[0]}{app.student?.nom?.[0]}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900">{(app.student?.prenom || '').toLowerCase()} {(app.student?.nom || '').toUpperCase()}</span>
                                                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                                                        {project.leader_id === app.student?.id ? 'Chef de projet' : 'Membre'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {project.leader_id !== app.student?.id && (
                                                    <button 
                                                        onClick={async () => {
                                                            await api.put(`/projects/${project.id}`, { leader_id: app.student?.id });
                                                            fetchProjectAndApps();
                                                        }}
                                                        className="text-[10px] font-bold text-blue-600 hover:underline"
                                                    >
                                                        Nommer chef
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleUpdateApplication(app.id, 'rejected')}
                                                    className="text-[10px] font-bold text-red-400 hover:text-red-600"
                                                >
                                                    Retirer
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              </div>

              {/* Section Collaborateurs (Enseignants) */}
              {user.id === project.creator_id && (
                <div className="space-y-4 pt-8">
                    <div className="flex items-center justify-between border-b pb-4">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Collaborateurs (Enseignants)</h3>
                            <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {project.collaborators?.length || 0}
                            </span>
                        </div>
                        <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-xl text-[10px] uppercase font-black"
                            onClick={() => setIsInviteModalOpen(true)}
                        >
                            Inviter un enseignant
                        </Button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {project.collaborators?.length === 0 ? (
                            <p className="text-sm text-slate-400 italic py-2">Aucun enseignant collaborateur invité.</p>
                        ) : (
                            project.collaborators?.map(collab => (
                                <div key={collab.id} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between hover:border-indigo-200 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase">
                                            {collab.prenom?.[0]}{collab.nom?.[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm">{(collab.prenom || '').toLowerCase()} {(collab.nom || '').toUpperCase()}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Enseignant</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleToggleCollaborator(collab.id, true)}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Retirer le collaborateur"
                                    >
                                        <UserMinus className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
              )}
           </div>
        )}

             {/* Archives Section */}
             {applications.filter(a => a.status === 'rejected').length > 0 && (
                 <div className="mt-16 p-8 bg-gray-50 rounded-[3rem] border border-gray-100/50">
                     <div className="flex items-center justify-between mb-8">
                         <h3 className="text-lg font-bold text-gray-400 flex items-center gap-3">
                            <XCircle className="w-5 h-5" />
                            Candidatures Refusées & Membres Retirés
                         </h3>
                         <Badge variant="outline" className="text-gray-400 border-gray-200">{applications.filter(a => a.status === 'rejected').length}</Badge>
                     </div>
                     
                     <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {applications.filter(a => a.status === 'rejected').map(app => (
                            <div key={app.id} className="p-4 bg-white/60 border border-gray-100 rounded-2xl flex flex-col gap-4 opacity-60 hover:opacity-100 transition-all hover:shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                                        {app.student?.prenom?.[0]}{app.student?.nom?.[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="font-bold text-sm text-gray-800 truncate">{(app.student?.prenom || '').toLowerCase()} {(app.student?.nom || '').toUpperCase()}</div>
                                        <div className="text-[10px] text-gray-400 truncate">{app.student?.email}</div>
                                    </div>
                                </div>
                                <button 
                                    className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg transition-colors border border-primary/10"
                                    onClick={() => handleUpdateApplication(app.id, 'accepted')}
                                >
                                    Réintégrer
                                </button>
                            </div>
                         ))}
                     </div>
                 </div>
             )}
      </div>

      {/* Modal pour postuler - Simple */}
      <Modal 
        isOpen={isApplyModalOpen} 
        onClose={() => setIsApplyModalOpen(false)} 
        title="Postuler au projet"
      >
        <form onSubmit={async (e) => {
            e.preventDefault();
            setIsApplying(true);
            try {
                const { data } = await api.post('/applications/', { project_id: parseInt(id), motivation_letter: motivationLetter });
                toast.success("Candidature envoyée !");
                setStudentApplication(data);
                setIsApplyModalOpen(false);
                setMotivationLetter('');
            } catch (error) {
                toast.error("Erreur lors de l'envoi");
            } finally {
                setIsApplying(false);
            }
        }} className="space-y-6 pt-2">
            
            <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase">Votre lettre de motivation</label>
                <textarea 
                    className="w-full min-h-[150px] p-4 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-all resize-none" 
                    placeholder="Décrivez votre intérêt pour ce projet..."
                    required
                    value={motivationLetter}
                    onChange={e => setMotivationLetter(e.target.value)}
                />
                <p className="text-[10px] text-slate-400">Minimum 50 caractères requis.</p>
            </div>
            
            <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsApplyModalOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={isApplying || motivationLetter.length < 50} className="flex-1">
                   {isApplying ? 'Envoi...' : 'Envoyer la candidature'}
                </Button>
            </div>
        </form>
      </Modal>

      {/* Certificate Modal */}
      <Modal 
        isOpen={isCertificateModalOpen} 
        onClose={() => setIsCertificateModalOpen(false)} 
        title="Votre Certificat"
      >
        <Certificate project={project} user={user} onClose={() => setIsCertificateModalOpen(false)} />
      </Modal>

      {/* Invite Teacher Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Inviter un Enseignant"
      >
        <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-500 italic">Seuls les enseignants de votre établissement peuvent être invités comme collaborateurs.</p>
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                {allTeachers.map(teacher => {
                    const isInvited = project.collaborators?.some(c => c.id === teacher.id);
                    return (
                        <div key={teacher.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-slate-400 text-[10px] uppercase border shadow-sm">
                                    {teacher.prenom?.[0]}{teacher.nom?.[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 text-sm">{(teacher.prenom || '').toLowerCase()} {(teacher.nom || '').toUpperCase()}</span>
                                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">{teacher.email}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleToggleCollaborator(teacher.id, isInvited)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                    isInvited 
                                    ? 'bg-red-50 text-red-500 hover:bg-red-100' 
                                    : 'bg-primary text-white hover:bg-primary/90'
                                }`}
                            >
                                {isInvited ? 'Retirer' : 'Inviter'}
                            </button>
                        </div>
                    );
                })}
                {allTeachers.length === 0 && (
                    <p className="text-center text-slate-400 italic py-8 text-sm">Aucun autre enseignant disponible.</p>
                )}
            </div>
            <div className="pt-4 flex justify-end">
                <Button onClick={() => setIsInviteModalOpen(false)}>Fermer</Button>
            </div>
        </div>
      </Modal>

      {/* Edit Project Modal */}
      {isEditModalOpen && editData && (
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            title="Modifier le Projet"
          >
            <form onSubmit={handleUpdateProject} className="space-y-4 pt-2">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titre du Projet</label>
                    <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10"
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Domaine d'étude</label>
                    <input 
                        required
                        type="text" 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10"
                        value={editData.domain}
                        onChange={(e) => setEditData({...editData, domain: e.target.value})}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                    <textarea 
                        required
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 min-h-[150px]"
                        value={editData.description}
                        onChange={(e) => setEditData({...editData, description: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Places totales</label>
                        <input 
                            required
                            type="number" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10"
                            value={editData.spots}
                            onChange={(e) => setEditData({...editData, spots: parseInt(e.target.value)})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date limite</label>
                        <input 
                            required
                            type="date" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10"
                            value={editData.deadline}
                            onChange={(e) => setEditData({...editData, deadline: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-4 grid grid-cols-2 gap-3">
                    <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
                    <Button type="submit">Sauvegarder</Button>
                </div>
            </form>
          </Modal>
      )}
    </div>
  )
}
