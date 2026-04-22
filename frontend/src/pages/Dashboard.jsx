import { useEffect, useState } from 'react';
import { Users, FolderKanban, Plus, Briefcase, Calendar, ShieldAlert, Send, CheckCircle2, XCircle, Clock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Badge } from '../components/Common/Badge';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [domainFilter, setDomainFilter] = useState('all');

    const stats = {
        postules: applications.length,
        acceptes: applications.filter(a => a.status === 'accepted').length,
        refuses: applications.filter(a => a.status === 'rejected').length,
        en_attente: applications.filter(a => a.status === 'pending').length
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (user?.role === 'etudiant') {
                    const { data: apps } = await api.get('/applications/');
                    setApplications(apps || []);
                    const appliedProjects = (apps || []).map(a => ({
                        ...(a.project || {}),
                        my_status: a.status,
                        application_id: a.id
                    }));
                    setProjects(appliedProjects);
                } else {
                    const { data } = await api.get('/projects/');
                    setProjects(data || []);
                }
            } catch (e) { 
                console.error("Dashboard fetch error:", e);
                setProjects([]);
            } finally { 
                setLoading(false); 
            }
        };
        if (user) fetchData();
    }, [user]);

    const domains = ['all', ...new Set(projects.map(p => p.domain).filter(Boolean))];

    const filteredProjects = projects.filter(p => {
        const title = p.title || '';
        const domain = p.domain || '';
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             domain.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || 
                             (user?.role === 'etudiant' ? p.my_status === statusFilter : p.status === statusFilter);
        const matchesDomain = domainFilter === 'all' || p.domain === domainFilter;
        return matchesSearch && matchesStatus && matchesDomain;
    });

  if (loading) return <div className="p-10 text-slate-400">Chargement...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Compact Welcome Section */}
      <div className="mb-8 text-center max-w-5xl mx-auto bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
        <h1 className="text-xl md:text-2xl font-light text-gray-400 italic mb-2">
          Bienvenue <span className="font-semibold text-gray-500">{(user?.prenom || '').toLowerCase()} {(user?.nom || '').toUpperCase()}</span> dans ScholarFlow.
        </h1>
        {user?.role !== 'creator' && (
          <>
            <p className="text-gray-400 text-[11px] italic mb-4 opacity-70">
              Nous espérons que vous avez reçu la conférence habituelle du système local Administrateur.
            </p>
            
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[10px] text-gray-400 font-medium italic opacity-60">
              <p>1/ Respectez la vie privée des autres.</p>
              <p>2/ Réfléchissez avant de taper.</p>
              <p>3/ Un grand pouvoir implique de grandes responsabilités.</p>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content: Projects Table - Hidden for Super Admin */}
        {/* Main Content: Projects Table - Hidden for Super Admin */}
        {user?.role !== 'creator' ? (
          <div className="lg:col-span-3 space-y-6">
            
            {/* Student Stats Cards */}
            {user?.role === 'etudiant' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                            <Send className="w-5 h-5 text-blue-500" />
                        </div>
                        <span className="text-2xl font-black text-slate-900">{stats.postules}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Postulés</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <span className="text-2xl font-black text-emerald-600">{stats.acceptes}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acceptés</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mb-3">
                            <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="text-2xl font-black text-red-600">{stats.refuses}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refusés</span>
                    </div>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <span className="text-2xl font-black text-amber-600">{stats.en_attente}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">En attente</span>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {user?.role === 'etudiant' ? 'Mes Candidatures' : 'Projets'}
                    </h2>
                    {user?.role === 'enseignant' && (
                        <button 
                            onClick={() => navigate('/dashboard/projects')}
                            className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Nouveau
                        </button>
                    )}
                </div>

                {/* Filter Bar for Students */}
                <div className="flex flex-col md:flex-row gap-4 pt-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filtrer mes projets..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:bg-white transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select 
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">Tous les statuts</option>
                            {user?.role === 'etudiant' ? (
                                <>
                                    <option value="pending">En attente</option>
                                    <option value="accepted">Accepté</option>
                                    <option value="rejected">Refusé</option>
                                </>
                            ) : (
                                <>
                                    <option value="open">Ouvert</option>
                                    <option value="completed">Clos</option>
                                </>
                            )}
                        </select>
                        <select 
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none"
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                        >
                            <option value="all">Tous les domaines</option>
                            {domains.filter(d => d !== 'all').map(d => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>
                    </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Projet</th>
                      <th className="px-8 py-5 text-center">
                        {user?.role === 'etudiant' ? 'Ma Candidature' : 'Statut Projet'}
                      </th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="px-8 py-12 text-center text-slate-400 italic">Chargement...</td>
                      </tr>
                    ) : filteredProjects.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-8 py-16 text-center">
                            <div className="flex flex-col items-center opacity-30">
                                <FolderKanban className="w-12 h-12 mb-3" />
                                <p className="text-sm font-bold uppercase tracking-widest">Aucun projet trouvé</p>
                            </div>
                        </td>
                      </tr>
                    ) : (
                      filteredProjects.map(p => (
                        <tr 
                          key={p.id} 
                          className="hover:bg-slate-50/50 transition-colors group"
                        >
                          <td className="px-8 py-5">
                            <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{p.title}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{p.domain}</div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            {user?.role === 'etudiant' ? (
                                <Badge 
                                    variant={p.my_status === 'accepted' ? 'success' : p.my_status === 'rejected' ? 'destructive' : 'secondary'} 
                                    className="text-[9px] font-black uppercase tracking-tighter"
                                >
                                    {p.my_status === 'accepted' ? 'Accepté' : p.my_status === 'rejected' ? 'Refusé' : 'En attente'}
                                </Badge>
                            ) : (
                                <Badge variant={p.status === 'open' ? 'success' : 'secondary'} className="text-[9px] font-black uppercase tracking-tighter">
                                    {p.status === 'open' ? 'Ouvert' : 'Clos'}
                                </Badge>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                             <button 
                                onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                                className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                             >
                                Voir Détails
                             </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
               <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center">
                  <ShieldAlert className="w-10 h-10 text-primary opacity-40" />
               </div>
               <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Console d'Administration Globale</h2>
               <p className="text-sm text-slate-500 max-w-md leading-relaxed">
                  Bienvenue dans l'interface de contrôle maître. Vous avez une visibilité totale sur les établissements et les utilisateurs de la plateforme ScholarFlow.
               </p>
            </div>
          </div>
        )}

        {/* Sidebar: Compact Role Info Boxes - Hidden for Super Admin */}
        <div className="lg:col-span-1 space-y-3">
          {user?.role !== 'creator' && (
            <>
              <div className="bg-gray-500/80 p-3 rounded-lg shadow-sm text-center">
                <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Administrateur</h3>
              </div>
              <div className="bg-gray-500/80 p-3 rounded-lg shadow-sm text-center">
                <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">CHEF de PROJET</h3>
              </div>
              <div className="bg-gray-500/80 p-3 rounded-lg shadow-sm text-center">
                <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Collaborateurs</h3>
              </div>
            </>
          )}
          
          <div className="mt-8 p-4 border-l-4 border-primary bg-primary/5 rounded-r">
             <p className="text-xs text-gray-500 font-medium italic">
               "Un grand pouvoir implique de grandes responsabilités."
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
