import React, { useState, useEffect } from 'react';
import { Search, Mail, Building, ShieldCheck, Trash2, Lock, Unlock, RotateCcw, UserX, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/Common/Badge';
import { toast } from 'sonner';
import { cn } from '../utils/utils';

export function UsersList() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'enseignant', 'etudiant'
    const [myProjects, setMyProjects] = useState([]);
    const [selectedUserToInvite, setSelectedUserToInvite] = useState(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const fetchUsers = async () => {
        if (!currentUser) return;
        try {
            const { data } = await api.get('/users/');
            setUsers(data);
            
            if (currentUser.role === 'enseignant') {
                const { data: projectsData } = await api.get('/projects/');
                setMyProjects(projectsData.filter(p => p.creator_id == currentUser.id));
            }
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser]);

    const handleUpdateStatus = async (userId, statusUpdate) => {
        try {
            await api.put(`/users/${userId}/status`, statusUpdate);
            toast.success("Statut mis à jour");
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.detail || "Erreur lors de la mise à jour");
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch = `${u.prenom} ${u.nom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = currentUser?.role === 'creator' || activeTab === 'all' || u.role === activeTab;
        return matchesSearch && matchesTab;
    });

    if (loading) return <div className="p-10 text-slate-400">Chargement de l'annuaire...</div>;

    const isEtabAdmin = currentUser?.role === 'etablissement' || currentUser?.role === 'creator';

    return (
        <div className="max-w-6xl mx-auto py-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        {currentUser?.role === 'enseignant' ? 'utilisateurs' : 'Gestion des Utilisateurs'}
                    </h1>
                    {currentUser?.role !== 'enseignant' && (
                        <p className="text-sm text-slate-500 font-medium">
                            {currentUser?.role === 'creator' ? 'Administrez les membres de votre application.' : 'Administrez les membres de votre établissement.'}
                        </p>
                    )}
                </div>
                
                {currentUser?.role !== 'creator' && (
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[
                            { id: 'all', label: 'Tous' },
                            { id: 'enseignant', label: 'Enseignants' },
                            { id: 'etudiant', label: 'Étudiants' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-6 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-white text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="relative group space-y-4">
                <div className="relative">
                    <Search className={cn(
                        "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300",
                        searchTerm ? "text-primary" : "text-slate-400"
                    )} />
                    <input 
                        type="text" 
                        placeholder={`Rechercher parmi les ${activeTab === 'all' ? 'membres' : activeTab === 'enseignant' ? 'enseignants' : 'étudiants'}...`}
                        className="w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none shadow-sm placeholder:italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40"></span>
                        {filteredUsers.length} {filteredUsers.length > 1 ? 'résultats trouvés' : 'résultat trouvé'}
                    </p>
                    {searchTerm && (
                        <p className="text-[10px] italic text-slate-400">
                            Filtré par : <span className="text-primary font-bold">"{searchTerm}"</span>
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/40">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Membre</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Rôle</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Statut</th>
                            <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px]">Contact</th>
                            {isEtabAdmin && <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</th>}
                            {currentUser?.role === 'enseignant' && <th className="px-6 py-5 font-black text-slate-400 uppercase tracking-widest text-[10px] text-right">Invitation</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={isEtabAdmin || currentUser?.role === 'enseignant' ? 5 : 4} className="px-6 py-20 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-4 opacity-40">
                                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 uppercase tracking-widest">Aucun résultat</p>
                                            <p className="text-xs text-slate-500 italic">Essayez d'ajuster vos filtres ou votre recherche.</p>
                                        </div>
                                        {searchTerm && (
                                            <button 
                                                onClick={() => setSearchTerm('')}
                                                className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest"
                                            >
                                                Réinitialiser la recherche
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(u => (
                                <tr key={u.id} className={`group hover:bg-slate-50/50 transition-all ${u.is_deleted ? 'opacity-50' : ''}`}>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200/50 uppercase">
                                                {u.prenom?.[0]}{u.nom?.[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-slate-900">{(u.prenom || '').toLowerCase()} {(u.nom || '').toUpperCase()}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Membre depuis {new Date(u.created_at || Date.now()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-1 bg-slate-50 border-slate-100 text-slate-500">
                                            {currentUser?.role === 'creator' 
                                                ? (u.role === 'creator' ? 'Administrateur' : u.role === 'etablissement' ? 'Établissement' : 'Utilisateur')
                                                : (u.role === 'etudiant' ? 'Étudiant' : u.role === 'enseignant' ? 'Enseignant' : u.role === 'etablissement' ? 'Établissement' : u.role)
                                            }
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            {u.is_deleted && (
                                                <Badge variant="destructive" className="text-[9px] font-black uppercase w-fit bg-slate-900 text-white border-none">Supprimé</Badge>
                                            )}
                                            {u.is_blocked && (
                                                <Badge variant="destructive" className="text-[9px] font-black uppercase w-fit">Bloqué</Badge>
                                            )}
                                            {!u.is_blocked && !u.is_deleted && (
                                                <Badge variant="success" className="text-[9px] font-black uppercase w-fit">Actif</Badge>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 opacity-40" />
                                            {u.email}
                                        </div>
                                    </td>
                                    {isEtabAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {u.id !== currentUser.id && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, { is_blocked: !u.is_blocked })}
                                                            className={`p-2 rounded-xl transition-all ${u.is_blocked ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}
                                                            title={u.is_blocked ? "Débloquer" : "Bloquer"}
                                                        >
                                                            {u.is_blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, { is_deleted: !u.is_deleted })}
                                                            className={`p-2 rounded-xl transition-all ${u.is_deleted ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}
                                                            title={u.is_deleted ? "Restaurer" : "Supprimer"}
                                                        >
                                                            {u.is_deleted ? <RotateCcw className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    )}

                                    {currentUser?.role === 'enseignant' && (
                                        <td className="px-6 py-4 text-right">
                                            {u.role === 'enseignant' && u.id !== currentUser.id && !u.is_deleted && (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedUserToInvite(u);
                                                        setIsInviteModalOpen(true);
                                                    }}
                                                    className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-primary hover:text-white transition-all"
                                                >
                                                    Inviter
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Invite to Project Modal */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Inviter à un projet</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                                Inviter {(selectedUserToInvite?.prenom || '').toLowerCase()} {(selectedUserToInvite?.nom || '').toUpperCase()}
                            </p>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sélectionnez le projet :</p>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {myProjects.map(project => {
                                    const isAlreadyCollab = project.collaborators?.some(c => c.id === selectedUserToInvite.id);
                                    return (
                                        <button 
                                            key={project.id}
                                            disabled={isAlreadyCollab}
                                            onClick={async () => {
                                                try {
                                                    await api.post(`/projects/${project.id}/collaborators/${selectedUserToInvite.id}`);
                                                    toast.success("Invitation envoyée !");
                                                    setIsInviteModalOpen(false);
                                                    fetchUsers();
                                                } catch (e) { toast.error("Erreur lors de l'invitation"); }
                                            }}
                                            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                                isAlreadyCollab 
                                                ? 'bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed' 
                                                : 'bg-white border-slate-100 hover:border-primary hover:bg-primary/5'
                                            }`}
                                        >
                                            <p className="font-bold text-slate-900 text-sm">{project.title}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                {isAlreadyCollab ? 'Déjà collaborateur' : 'Cliquer pour inviter'}
                                            </p>
                                        </button>
                                    );
                                })}
                                {myProjects.length === 0 && (
                                    <p className="text-center text-slate-400 italic py-8 text-sm">Vous n'avez aucun projet actif.</p>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsInviteModalOpen(false)}
                            className="w-full py-4 bg-slate-100 text-slate-500 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-slate-200 transition-all"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
