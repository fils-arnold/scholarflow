import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Users, Briefcase } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/Common/Badge';

export function ProjectsList() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'completed'
    const [domainFilter, setDomainFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const projectsPerPage = 10;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        domain: '',
        spots: 5,
        deadline: ''
    });

    const fetchProjects = async () => {
        try {
            const { data } = await api.get('/projects/');
            setProjects(data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post('/projects/', newProject);
            toast.success("Projet créé avec succès !");
            setIsCreateModalOpen(false);
            setNewProject({ title: '', description: '', domain: '', spots: 5, deadline: '' });
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Erreur lors de la création");
        } finally {
            setIsSubmitting(false);
        }
    };

    const domains = ['all', ...new Set(projects.map(p => p.domain).filter(Boolean))];

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             p.domain.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchesDomain = domainFilter === 'all' || p.domain === domainFilter;
        return matchesSearch && matchesStatus && matchesDomain;
    });

    const indexOfLastProject = currentPage * projectsPerPage;
    const indexOfFirstProject = indexOfLastProject - projectsPerPage;
    const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
    const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, domainFilter]);

    if (loading) return <div className="p-10 text-slate-400">Chargement...</div>;

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Catalogue des Projets</h1>
                    <p className="text-sm text-slate-500">Explorez et gérez les initiatives académiques.</p>
                </div>
                {user?.role === 'enseignant' && (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-primary text-white px-6 py-3 rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        <Plus className="w-5 h-5" /> Créer un projet
                    </button>
                )}
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un projet, un mot-clé..."
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                        {[
                            { id: 'all', label: 'Tous' },
                            { id: 'open', label: 'Actifs' },
                            { id: 'completed', label: 'Clos' }
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setStatusFilter(f.id)}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                                    statusFilter === f.id 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Domaine</span>
                        <select 
                            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 outline-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                            value={domainFilter}
                            onChange={(e) => setDomainFilter(e.target.value)}
                        >
                            {domains.map(d => (
                                <option key={d} value={d}>
                                    {d === 'all' ? 'Tous les domaines' : d}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {currentProjects.map(p => (
                    <div 
                        key={p.id} 
                        onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                        className="bg-white border border-slate-100 p-6 rounded-[2rem] hover:border-primary/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-xl hover:shadow-slate-200/50"
                    >
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{p.domain}</span>
                                <Badge variant={p.status === 'open' ? 'success' : 'secondary'} className="text-[9px]">
                                    {p.status === 'open' ? 'Actif' : 'Clos'}
                                </Badge>
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900">{p.title}</h3>
                            <p className="text-sm text-slate-500 line-clamp-1">{p.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-8 text-xs text-slate-400 font-medium">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{p.spots_remaining} places</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(p.deadline).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                    >
                        <Plus className="w-4 h-4 rotate-[-90deg]" />
                    </button>
                    <div className="flex gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                    : 'bg-white text-slate-400 border border-slate-100 hover:border-primary/30 hover:text-primary'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className="p-2 rounded-xl bg-white border border-slate-200 disabled:opacity-30 hover:bg-slate-50 transition-all"
                    >
                        <Plus className="w-4 h-4 rotate-90" />
                    </button>
                </div>
            )}

            {/* Modal Création Projet */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Sidebar décorative */}
                            <div className="hidden md:flex w-1/3 bg-primary p-10 flex-col justify-between text-white relative overflow-hidden">
                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                                        <Briefcase className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight leading-none mb-4">Lancer une Initiative</h3>
                                    <p className="text-sm text-primary-foreground/70 font-medium leading-relaxed">
                                        Définissez votre vision, trouvez vos talents et gérez votre projet académique en toute simplicité.
                                    </p>
                                </div>
                                <div className="relative z-10 text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                                    ScholarFlow Pro
                                </div>
                                {/* Cercles décoratifs */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-24 -mb-24"></div>
                            </div>

                            {/* Formulaire */}
                            <div className="flex-1 p-8 md:p-12 space-y-6 max-h-[90vh] overflow-y-auto">
                                <div className="flex items-center justify-between md:hidden mb-4">
                                    <h3 className="text-xl font-black text-slate-900 uppercase">Nouveau Projet</h3>
                                    <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateProject} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titre du Projet</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Ex: IA et Éthique..."
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                                value={newProject.title}
                                                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Domaine</label>
                                            <input 
                                                required
                                                type="text" 
                                                placeholder="Ex: Informatique, Santé..."
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                                value={newProject.domain}
                                                onChange={(e) => setNewProject({...newProject, domain: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                        <textarea 
                                            required
                                            placeholder="Décrivez les objectifs et les attentes..."
                                            className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm min-h-[120px]"
                                            value={newProject.description}
                                            onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Places Disponibles</label>
                                            <input 
                                                required
                                                type="number" 
                                                min="1"
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                                value={newProject.spots}
                                                onChange={(e) => setNewProject({...newProject, spots: parseInt(e.target.value)})}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Date Limite</label>
                                            <input 
                                                required
                                                type="date" 
                                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                                                value={newProject.deadline}
                                                onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-6 flex flex-col md:flex-row gap-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-[2] py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Création...' : 'Lancer le Projet'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const X = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);
