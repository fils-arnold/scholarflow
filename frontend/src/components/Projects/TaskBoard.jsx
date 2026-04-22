import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Clock, Plus, Edit, Trash2, Calendar, User, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'sonner';
import { Button } from '../Common/Button';

export function TaskBoard({ projectId, isCreator, acceptedMembers }) {
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [newTask, setNewTask] = useState({
        titre: '',
        description: '',
        priorite: 'medium',
        echeance: '',
        assignee_id: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const { data } = await api.get(`/tasks/project/${projectId}`);
            setTasks(data);
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const updateStatus = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { statut: newStatus });
            toast.success("Statut mis à jour");
            fetchTasks();
        } catch (e) { toast.error("Erreur lors de la mise à jour"); }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.post(`/tasks/project/${projectId}`, {
                ...newTask,
                assignee_id: newTask.assignee_id || null
            });
            toast.success("Tâche créée !");
            setIsCreateModalOpen(false);
            setNewTask({ titre: '', description: '', priorite: 'medium', echeance: '', assignee_id: '' });
            fetchTasks();
        } catch (e) { toast.error("Erreur lors de la création"); }
        finally { setIsSubmitting(false); }
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await api.put(`/tasks/${editingTask.id}`, {
                titre: editingTask.titre,
                description: editingTask.description,
                priorite: editingTask.priorite,
                echeance: editingTask.echeance,
                assignee_id: editingTask.assignee_id || null
            });
            toast.success("Tâche mise à jour !");
            setIsEditModalOpen(false);
            setEditingTask(null);
            fetchTasks();
        } catch (e) { toast.error("Erreur lors de la mise à jour"); }
        finally { setIsSubmitting(false); }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm("Supprimer cette tâche ?")) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            toast.success("Tâche supprimée");
            fetchTasks();
        } catch (e) { toast.error("Erreur lors de la suppression"); }
    };

    const getAssigneeName = (id) => {
        const member = acceptedMembers.find(m => m.id === id);
        if (!member) return null;
        return `${member.prenom} ${member.nom}`;
    };

    if (isLoading) return (
        <div className="flex items-center justify-center p-20">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
    );

    const columns = [
        { id: 'todo', label: 'À faire', color: 'border-slate-200', bg: 'bg-slate-50/50' },
        { id: 'in_progress', label: 'En cours', color: 'border-primary/30', bg: 'bg-primary/5' },
        { id: 'done', label: 'Terminé', color: 'border-emerald-200', bg: 'bg-emerald-50/30' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">tâches</h2>
                    <p className="text-xs text-gray-500 font-medium">Gérez l'avancement des tâches en temps réel</p>
                </div>
                {isCreator && (
                    <Button 
                        size="sm" 
                        className="rounded-xl shadow-lg shadow-primary/20"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" /> nouvelle tâche
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(column => (
                    <div key={column.id} className={`flex flex-col min-h-[500px] rounded-[2rem] border ${column.color} ${column.bg} p-4`}>
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    column.id === 'todo' ? 'bg-slate-400' : 
                                    column.id === 'in_progress' ? 'bg-primary' : 'bg-emerald-500'
                                }`} />
                                <h3 className="text-sm font-black tracking-widest text-gray-700">{column.label.toLowerCase()}</h3>
                            </div>
                            <span className="bg-white/50 px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 border border-white/50">
                                {tasks.filter(t => t.statut === column.id).length}
                            </span>
                        </div>

                        <div className="space-y-4 flex-1">
                            {tasks.filter(t => t.statut === column.id).map(task => (
                                <div 
                                    key={task.id} 
                                    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md ${
                                            task.priorite === 'high' ? 'bg-red-50 text-red-600' :
                                            task.priorite === 'medium' ? 'bg-amber-50 text-amber-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                            {task.priorite || 'Normal'}
                                        </span>
                                        {isCreator && (
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={() => {
                                                        setEditingTask({
                                                            ...task,
                                                            echeance: task.echeance ? task.echeance.split('T')[0] : ''
                                                        });
                                                        setIsEditModalOpen(true);
                                                    }}
                                                    className="p-1 text-slate-300 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    onClick={() => deleteTask(task.id)}
                                                    className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <h4 className="text-sm font-bold text-gray-800 mb-2 leading-tight group-hover:text-primary transition-colors">
                                        {task.titre}
                                    </h4>
                                    
                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                                        {task.description}
                                    </p>

                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Calendar className="w-3 h-3" />
                                            <span className="text-[10px] font-bold">
                                                {task.echeance ? new Date(task.echeance).toLocaleDateString() : 'Pas de date'}
                                            </span>
                                        </div>
                                        
                                        <div className="flex -space-x-2">
                                            {task.assignee_id ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[8px] font-black text-primary uppercase">
                                                        {getAssigneeName(task.assignee_id)?.[0]}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-gray-500 lowercase">{getAssigneeName(task.assignee_id)}</span>
                                                </div>
                                            ) : (
                                                <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                    ?
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 flex gap-1">
                                        {column.id !== 'todo' && (
                                            <button 
                                                onClick={() => updateStatus(task.id, 'todo')}
                                                className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-[10px] font-bold uppercase tracking-tighter rounded-lg transition-colors"
                                            >
                                                À faire
                                            </button>
                                        )}
                                        {column.id !== 'in_progress' && (
                                            <button 
                                                onClick={() => updateStatus(task.id, 'in_progress')}
                                                className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-tighter rounded-lg transition-colors"
                                            >
                                                En cours
                                            </button>
                                        )}
                                        {column.id !== 'done' && (
                                            <button 
                                                onClick={() => updateStatus(task.id, 'done')}
                                                className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase tracking-tighter rounded-lg transition-colors"
                                            >
                                                Terminé
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {tasks.filter(t => t.statut === column.id).length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-40 border-2 border-dashed border-gray-200 rounded-3xl py-10">
                                    <AlertCircle className="w-8 h-8 mb-2" />
                                    <p className="text-[10px] font-black uppercase">Vide</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Création Tâche */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nouvelle Tâche</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titre de la tâche</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none"
                                    placeholder="Ex: Rédiger l'introduction..."
                                    value={newTask.titre}
                                    onChange={(e) => setNewTask({...newTask, titre: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none min-h-[100px]"
                                    placeholder="Détails de la tâche..."
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priorité</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                                        value={newTask.priorite}
                                        onChange={(e) => setNewTask({...newTask, priorite: e.target.value})}
                                    >
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Échéance</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                                        value={newTask.echeance}
                                        onChange={(e) => setNewTask({...newTask, echeance: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigner à un membre</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                                    value={newTask.assignee_id}
                                    onChange={(e) => setNewTask({...newTask, assignee_id: e.target.value})}
                                >
                                    <option value="">Non assignée</option>
                                    {acceptedMembers.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {(member.prenom || '').toLowerCase()} {(member.nom || '').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4">
                                <Button 
                                    type="submit" 
                                    className="w-full py-4 rounded-2xl shadow-xl shadow-primary/20 font-black uppercase tracking-[0.2em] text-[10px]"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Création...' : 'Créer la tâche'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Modification Tâche */}
            {isEditModalOpen && editingTask && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Modifier la Tâche</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                                <Plus className="w-5 h-5 rotate-45 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateTask} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Titre de la tâche</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none"
                                    value={editingTask.titre}
                                    onChange={(e) => setEditingTask({...editingTask, titre: e.target.value})}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-primary/10 outline-none min-h-[100px]"
                                    value={editingTask.description}
                                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Priorité</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                                        value={editingTask.priorite}
                                        onChange={(e) => setEditingTask({...editingTask, priorite: e.target.value})}
                                    >
                                        <option value="low">Faible</option>
                                        <option value="medium">Moyenne</option>
                                        <option value="high">Haute</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Échéance</label>
                                    <input 
                                        type="date" 
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                                        value={editingTask.echeance}
                                        onChange={(e) => setEditingTask({...editingTask, echeance: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigner à un membre</label>
                                <select 
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none"
                                    value={editingTask.assignee_id || ''}
                                    onChange={(e) => setEditingTask({...editingTask, assignee_id: e.target.value})}
                                >
                                    <option value="">Non assignée</option>
                                    {acceptedMembers.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {(member.prenom || '').toLowerCase()} {(member.nom || '').toUpperCase()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="pt-4 grid grid-cols-2 gap-3">
                                <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Mise à jour...' : 'Sauvegarder'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const MoreHorizontal = ({ className }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" height="24" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
    </svg>
);
