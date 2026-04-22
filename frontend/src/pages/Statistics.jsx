import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, Users, Calendar, Download, Building, 
  Briefcase, MousePointerClick, History, Search,
  ArrowUpRight, Clock, Activity, Zap, Target
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/90 backdrop-blur-xl p-4 border border-white/50 rounded-2xl shadow-2xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
                <p className="text-xl font-black text-slate-900">{payload[0].value} <span className="text-xs text-primary font-bold">unités</span></p>
            </div>
        );
    }
    return null;
};

export default function Statistics() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/analytics/overview');
            setStats(data);
        } catch (err) {
            console.error(err);
            toast.error("Impossible de charger les statistiques.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4 text-slate-400">
                <Activity className="w-12 h-12 animate-pulse text-primary" />
                <p className="text-xs font-black uppercase tracking-[0.3em]">Analyse stratégique en cours...</p>
            </div>
        </div>
    );

    if (!stats) return null;

    const roleData = Object.entries(stats.role_distribution).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-12 pb-24 max-w-[1600px] mx-auto animate-in fade-in duration-700">
            {/* Header: Visual Impact */}
            <div className="relative overflow-hidden bg-slate-900 p-12 rounded-[3rem] shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-primary p-3 rounded-2xl shadow-lg shadow-primary/30">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Tableau de Bord Stratégique</h1>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs max-w-xl leading-loose">
                        Visualisez l'impact et l'évolution de votre écosystème académique en temps réel. Analyse basée sur les activités récentes.
                    </p>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Connexions actives", val: stats.logins.reduce((a,b) => a + b.count, 0), icon: Zap, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
                    { label: "Utilisateurs Totaux", val: stats.registrations.reduce((a,b) => a + b.count, 0), icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                    { label: "Domaines de Recherche", val: stats.top_sectors.length, icon: Target, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
                    { label: "Établissements Clés", val: stats.top_etablissements.length || 1, icon: Building, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                ].map((s, i) => (
                    <div key={i} className={`bg-white p-8 rounded-[2.5rem] border ${s.border} shadow-sm group hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
                        <div className={`w-14 h-14 ${s.bg} ${s.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <s.icon className="w-7 h-7" />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-4xl font-black text-slate-900 tabular-nums">{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Main Charts Area */}
            <div className="grid lg:grid-cols-3 gap-10">
                {/* Trend Analysis */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 mb-1">Croissance & Activité</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Évolution temporelle des connexions</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase">Données réelles</span>
                        </div>
                    </div>
                    <div className="h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.logins}>
                                <defs>
                                    <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                                    dy={20}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 10, fill: '#94a3b8', fontWeight: 700}} 
                                    dx={-20}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#06b6d4', strokeWidth: 2 }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#06b6d4" 
                                    strokeWidth={6} 
                                    fillOpacity={1} 
                                    fill="url(#colorLogins)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Role Distribution: Circular Visual */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col items-center">
                    <h3 className="text-2xl font-black text-slate-900 mb-2 w-full">Communauté</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-12 w-full text-left">Répartition par profils</p>
                    <div className="flex-1 w-full flex items-center justify-center relative min-h-[350px]">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <p className="text-3xl font-black text-slate-900">
                                {roleData.reduce((a,b) => a + b.value, 0)}
                            </p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total</p>
                        </div>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={roleData}
                                    innerRadius="75%"
                                    outerRadius="95%"
                                    paddingAngle={10}
                                    dataKey="value"
                                    animationDuration={1500}
                                >
                                    {roleData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={10} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full mt-8">
                        {roleData.map((r, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
                                <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-900 uppercase truncate">{r.name}</p>
                                    <p className="text-sm font-black text-slate-400">{r.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid lg:grid-cols-2 gap-10">
                {/* Active Sectors: Bar Visual */}
                <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-emerald-100 p-2.5 rounded-xl">
                            <Zap className="w-6 h-6 text-emerald-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Secteurs Porteurs</h3>
                    </div>
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.top_sectors} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="domain" 
                                    type="category" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    width={140} 
                                    tick={{fontSize: 10, fontWeight: 900, fill: '#64748b', textTransform: 'uppercase'}}
                                />
                                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                                <Bar 
                                    dataKey="count" 
                                    fill="#8b5cf6" 
                                    radius={[0, 20, 20, 0]} 
                                    barSize={20}
                                    animationDuration={1800}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Institutions (Dynamic Ranking) */}
                {user?.role === 'creator' && (
                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-100/50">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="bg-indigo-100 p-2.5 rounded-xl">
                                <Building className="w-6 h-6 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Établissements Leader</h3>
                        </div>
                        <div className="space-y-6">
                            {stats.top_etablissements.map((etab, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-slate-900 text-white flex items-center justify-center rounded-xl font-black text-xs shadow-lg">
                                            {i + 1}
                                        </div>
                                        <div>
                                            <span className="font-black text-slate-900 text-sm uppercase tracking-tight">{etab.name}</span>
                                            <p className="text-[10px] font-bold text-slate-400">Croissance active</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 flex-1 max-w-[200px] ml-12">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-1000" 
                                                style={{width: `${(etab.count / stats.top_etablissements[0].count) * 100}%`}}
                                            ></div>
                                        </div>
                                        <span className="text-[11px] font-black text-slate-900 tabular-nums min-w-[60px] text-right">{etab.count} PERS.</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
