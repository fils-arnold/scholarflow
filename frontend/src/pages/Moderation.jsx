import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { ShieldAlert, Archive, Users, UserX, UserCheck, Search, Building, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export default function Moderation() {
    const [activeTab, setActiveTab] = useState('all'); // all, violations, archive
    const [archiveFilter, setArchiveFilter] = useState('all'); // all, own, admin_no_consent, admin_consent
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setCurrentUser(JSON.parse(userStr));
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            if (activeTab === 'violations') endpoint = '/moderation/violations';
            else if (activeTab === 'archive') endpoint = '/moderation/archive';
            else if (activeTab === 'all') endpoint = '/moderation/users';

            const response = await api.get(endpoint);
            setUsers(response.data);
        } catch (err) {
            console.error(err);
            toast.error(`Erreur: ${err.response?.data?.detail || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (userId, action) => {
        try {
            if (action === 'block' || action === 'delete') {
                await api.post(`/moderation/block/${userId}`, { action });
                toast.success(`Utilisateur ${action === 'block' ? 'bloqué' : 'supprimé'} avec succès`);
            } else if (action === 'reintegrate') {
                await api.post(`/moderation/reintegrate/${userId}`);
                toast.success("Utilisateur réintégré avec succès");
            } else if (action === 'report') {
                const reportReason = prompt("Veuillez indiquer quelle condition d'utilisation n'a pas été respectée :");
                if (!reportReason) return;
                await api.post(`/moderation/report/${userId}`, { reason: reportReason });
                toast.success("Utilisateur déplacé vers la gestion des violations");
            } else if (action === 'consent') {
                await api.post(`/moderation/consent/${userId}`, { consent: true });
                toast.success("Accord donné au Super Admin pour la suppression");
            }
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.detail || "Action non autorisée");
        }
    };

    const getFilteredUsers = () => {
        let list = users.filter(user => 
            user.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (activeTab === 'archive' && currentUser?.role === 'etablissement') {
            if (archiveFilter === 'own') return list.filter(u => u.blocked_by_id === currentUser.id);
            if (archiveFilter === 'admin_no_consent') return list.filter(u => u.blocked_by_id !== currentUser.id && !u.establishment_consent);
            if (archiveFilter === 'admin_consent') return list.filter(u => u.blocked_by_id !== currentUser.id && u.establishment_consent);
        }
        return list;
    };

    const filteredUsers = getFilteredUsers();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShieldAlert className="w-8 h-8 text-primary" />
                    Centre de Modération
                </h1>
            </div>

            {/* Main Tabs */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'all' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Users className="w-4 h-4" /> Annuaire (Vue seule)
                </button>
                <button 
                    onClick={() => setActiveTab('violations')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'violations' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <ShieldAlert className="w-4 h-4" /> Gestion des Violations
                </button>
                <button 
                    onClick={() => setActiveTab('archive')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'archive' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Archive className="w-4 h-4" /> Archives & Réintégration
                </button>
            </div>

            {/* Archive Sub-filters for Establishments */}
            {activeTab === 'archive' && currentUser?.role === 'etablissement' && (
                <div className="flex gap-2 text-xs">
                    <button onClick={() => setArchiveFilter('all')} className={`px-3 py-1 rounded-full border ${archiveFilter === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600'}`}>Tout</button>
                    <button onClick={() => setArchiveFilter('own')} className={`px-3 py-1 rounded-full border ${archiveFilter === 'own' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600'}`}>Nos Actions (Réintégrables)</button>
                    <button onClick={() => setArchiveFilter('admin_no_consent')} className={`px-3 py-1 rounded-full border ${archiveFilter === 'admin_no_consent' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600'}`}>Admin (Sans Accord - Bloqué)</button>
                    <button onClick={() => setArchiveFilter('admin_consent')} className={`px-3 py-1 rounded-full border ${archiveFilter === 'admin_consent' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600'}`}>Admin (Avec Accord - Bloqué)</button>
                </div>
            )}

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                    type="text" 
                    placeholder="Rechercher un utilisateur..." 
                    className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="px-6 py-4 text-sm font-semibold">Utilisateur</th>
                            <th className="px-6 py-4 text-sm font-semibold">Affiliation</th>
                            {activeTab === 'violations' && <th className="px-6 py-4 text-sm font-semibold text-red-600">Violation ToU</th>}
                            <th className="px-6 py-4 text-sm font-semibold">Auteur Action</th>
                            <th className="px-6 py-4 text-sm font-semibold">Statut</th>
                            <th className="px-6 py-4 text-sm font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Chargement...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Aucun utilisateur dans cette catégorie.</td></tr>
                        ) : filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-muted/30 transition">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                            {user.prenom?.[0] || ''}{user.nom?.[0] || ''}
                                        </div>
                                        <div>
                                            <div className="font-medium">{user.prenom} {user.nom}</div>
                                            <div className="text-xs text-muted-foreground">{user.email} - <span className="capitalize italic">{user.role}</span></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4 text-muted-foreground" /> 
                                        {user.etablissement?.nom || <span className="text-xs italic text-muted-foreground">Indépendant / Global</span>}
                                    </div>
                                </td>
                                {activeTab === 'violations' && (
                                    <td className="px-6 py-4 text-sm text-red-600 font-semibold italic">
                                        "{user.violation_reason}"
                                    </td>
                                )}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        {user.blocked_by_id === currentUser?.id ? (
                                            <span className="text-xs text-green-700 font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Votre Établissement</span>
                                        ) : user.blocked_by_id ? (
                                            <span className="text-xs text-red-700 font-medium flex items-center gap-1"><ShieldAlert className="w-3 h-3"/> Super Admin</span>
                                        ) : (
                                            <span className="text-xs text-gray-400">Aucune action</span>
                                        )}
                                        {user.establishment_consent && (
                                            <span className="text-[10px] text-blue-600 italic">Accord donné</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {user.is_deleted ? (
                                        <span className="text-[10px] font-bold text-red-500 border border-red-500 px-1 rounded uppercase">Supprimé</span>
                                    ) : user.is_blocked ? (
                                        <span className="text-[10px] font-bold text-orange-500 border border-orange-500 px-1 rounded uppercase">Bloqué</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-green-500 border border-green-500 px-1 rounded uppercase">Actif</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {activeTab === 'all' && currentUser?.role === 'etablissement' && (
                                            <>
                                                <button onClick={() => handleAction(user.id, 'report')} className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded hover:bg-orange-100 transition">Signaler</button>
                                                <button onClick={() => handleAction(user.id, 'block')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Bloquer Directement"><UserX className="w-5 h-5" /></button>
                                            </>
                                        )}
                                        
                                        {activeTab === 'violations' && (
                                            <>
                                                {currentUser?.role === 'etablissement' && !user.establishment_consent && (
                                                    <button onClick={() => handleAction(user.id, 'consent')} className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition">Donner Accord</button>
                                                )}
                                                <button onClick={() => handleAction(user.id, 'block')} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Bloquer"><UserX className="w-5 h-5" /></button>
                                                <button onClick={() => handleAction(user.id, 'delete')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="Supprimer"><UserX className="w-5 h-5" /></button>
                                            </>
                                        )}
                                        
                                        {activeTab === 'archive' && (
                                            <>
                                                {(currentUser?.role === 'creator' || user.blocked_by_id === currentUser?.id) ? (
                                                    <button onClick={() => handleAction(user.id, 'reintegrate')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition" title="Réintégrer"><UserCheck className="w-5 h-5" /></button>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground italic">Non réintégrable par vous</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
