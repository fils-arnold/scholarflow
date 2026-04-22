import React, { useRef } from 'react';
import { Award, ShieldCheck, Calendar, Download, Building, User as UserIcon } from 'lucide-react';

export function Certificate({ project, user, onClose }) {
    const printRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex flex-col items-center gap-8 py-4 animate-in zoom-in-95 duration-500">
            {/* Certificate Preview */}
            <div 
                ref={printRef}
                className="relative w-[800px] aspect-[1.414] bg-white border-[20px] border-double border-primary/20 p-12 shadow-2xl overflow-hidden print:shadow-none print:border-primary"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                {/* Background Decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
                
                {/* Content */}
                <div className="relative h-full border-4 border-primary/10 p-10 flex flex-col items-center text-center">
                    <div className="mb-8">
                        <Award className="w-20 h-20 text-primary mx-auto" />
                        <h1 className="text-5xl font-black text-gray-900 mt-4 tracking-tighter uppercase italic">ScholarFlow</h1>
                        <p className="text-xs font-bold text-primary tracking-[0.5em] uppercase mt-2">Excellence Académique</p>
                    </div>

                    <div className="space-y-6 flex-1">
                        <h2 className="text-2xl font-serif italic text-gray-500">Ce certificat est fièrement décerné à</h2>
                        <div className="relative inline-block">
                            <h3 className="text-4xl font-black text-gray-900 border-b-4 border-primary/20 px-8 pb-2">
                                {user.prenom} {user.nom}
                            </h3>
                        </div>

                        <p className="text-lg text-gray-600 max-w-lg mx-auto leading-relaxed">
                            Pour sa contribution exceptionnelle et la réussite du projet de recherche intitulé
                        </p>

                        <h4 className="text-2xl font-bold text-primary max-w-xl mx-auto italic">
                            « {project.title} »
                        </h4>

                        <div className="grid grid-cols-2 gap-10 mt-12 text-left w-full max-w-2xl">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Établissement</p>
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                    <Building className="w-4 h-4 text-primary" />
                                    {project.etablissement?.nom}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Domaine d'Étude</p>
                                <p className="font-bold text-gray-900 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" />
                                    {project.domain}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Signatures */}
                    <div className="w-full grid grid-cols-3 items-end mt-12">
                        <div className="text-left">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Date d'achèvement</p>
                            <p className="font-bold text-gray-900">{new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 border-4 border-primary/20 rounded-full flex items-center justify-center relative">
                                <ShieldCheck className="w-12 h-12 text-primary" />
                                <div className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full animate-spin-slow"></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-tighter">Signature du Superviseur</p>
                            <p className="font-serif italic text-xl text-gray-900">{project.creator?.prenom} {project.creator?.nom}</p>
                            <div className="h-px bg-gray-200 mt-1"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-2xl"
                >
                    Fermer
                </button>
                <button 
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200"
                >
                    <Download className="w-5 h-5" /> Télécharger / Imprimer
                </button>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .print-area, .print-area * { visibility: visible; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; }
                }
            `}</style>
        </div>
    );
}
