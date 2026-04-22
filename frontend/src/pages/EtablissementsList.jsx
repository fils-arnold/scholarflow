import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/Common/Card'
import { Button } from '../components/Common/Button'
import { Badge } from '../components/Common/Badge'
import { Search, Lock, Unlock, Trash2, Building, Mail, Phone, FileText } from 'lucide-react'
import { Input } from '../components/Common/Input'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'

export function EtablissementsList() {
  const [etablissements, setEtablissements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('actifs') // 'actifs' or 'supprimes'
  const { user } = useAuth()

  const fetchEtablissements = async () => {
    try {
      const { data } = await api.get('/etablissements/')
      setEtablissements(data)
    } catch (error) {
      console.error("Error fetching etablissements", error)
      toast.error("Erreur lors du chargement des établissements")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'creator') {
        fetchEtablissements()
    }
  }, [user])

  const handleBlockEtablissement = async (etabId, currentBlockedStatus) => {
    if (!window.confirm(`Voulez-vous vraiment ${currentBlockedStatus ? 'débloquer' : 'bloquer'} cet établissement ? Cela ${currentBlockedStatus ? 'débloquera' : 'bloquera'} également tous ses utilisateurs !`)) return;
    try {
        await api.put(`/etablissements/${etabId}/block?block=${!currentBlockedStatus}`);
        toast.success(`Établissement et ses utilisateurs ${currentBlockedStatus ? 'débloqués' : 'bloqués'} avec succès`);
        fetchEtablissements();
    } catch (error) {
        toast.error("Erreur lors de l'opération");
    }
  }

  const handleDeleteEtablissement = async (etabId) => {
    if (!window.confirm("Action irréversible. Voulez-vous vraiment supprimer cet établissement et toutes ses données associées ?")) return;
    try {
        await api.delete(`/etablissements/${etabId}`);
        toast.success("Établissement supprimé");
        fetchEtablissements();
    } catch (error) {
        toast.error("Erreur lors de la suppression");
    }
  }

  const handleRestoreEtablissement = async (etabId) => {
    if (!window.confirm("Voulez-vous réintégrer cet établissement ? Tous ses utilisateurs seront également débloqués.")) return;
    try {
        await api.put(`/etablissements/${etabId}/restore`);
        toast.success("Établissement réintégré");
        fetchEtablissements();
    } catch (error) {
        toast.error("Erreur lors de la réintégration");
    }
  }

  const filteredEtablissements = useMemo(() => {
    return etablissements.filter(e => {
      const isDeletedTab = activeTab === 'supprimes';
      const isActiveMatch = isDeletedTab ? !e.is_active : e.is_active;

      return isActiveMatch && (
        (e.nom && e.nom.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (e.email_contact && e.email_contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (e.type_etablissement && e.type_etablissement.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
  }, [etablissements, searchTerm, activeTab])

  if (isLoading) return <div className="p-8 text-center"><div className="animate-pulse h-12 w-48 bg-muted rounded mx-auto"></div></div>

  if (user?.role !== 'creator') {
      return <div className="p-8 text-center text-red-500">Accès refusé.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Établissements</h2>
          <p className="text-muted-foreground">Supervisez et gérez tous les établissements inscrits sur ScholarFlow.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b">
          <button 
            className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'actifs' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('actifs')}
          >
            Actifs
          </button>
          <button 
            className={`pb-2 px-1 font-medium transition-colors ${activeTab === 'supprimes' ? 'border-b-2 border-red-500 text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('supprimes')}
          >
            Supprimés
          </button>
      </div>

      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Rechercher par nom, email, ou type..." 
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEtablissements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed rounded-xl">
            Aucun établissement trouvé.
          </div>
        ) : (
          filteredEtablissements.map(e => (
            <Card key={e.id} className={`flex flex-col ${e.is_blocked ? 'opacity-60 grayscale' : ''}`}>
              <CardHeader className="pb-3 border-b border-muted/50 mb-3 bg-muted/10">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold border border-blue-500/20">
                        <Building className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-lg leading-tight mb-1">{e.nom}</CardTitle>
                        <div className="text-xs text-muted-foreground flex items-center">
                            {e.type_etablissement || "Non spécifié"}
                            {e.is_blocked && <Badge variant="destructive" className="ml-2 text-[10px] h-4">Bloqué</Badge>}
                        </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 text-slate-400" /> <span className="truncate">{e.email_contact}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 text-slate-400" /> <span>{e.telephone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4 text-slate-400" /> <span className="truncate text-xs">Arrêté: {e.num_arrete_creation || 'N/A'}</span>
                </div>
              </CardContent>
              <div className="p-4 pt-0 border-t mt-auto flex justify-end gap-2 pt-4 bg-muted/5">
                  {e.is_active ? (
                      <>
                          <Button 
                            variant={e.is_blocked ? "outline" : "secondary"} 
                            size="sm" 
                            onClick={() => handleBlockEtablissement(e.id, e.is_blocked)}
                            title={e.is_blocked ? "Débloquer l'établissement et ses membres" : "Bloquer l'établissement et ses membres"}
                            className={e.is_blocked ? "border-green-500/50 text-green-600 hover:bg-green-50" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}
                          >
                              {e.is_blocked ? (
                                  <><Unlock className="h-4 w-4 mr-1.5" /> Débloquer</>
                              ) : (
                                  <><Lock className="h-4 w-4 mr-1.5" /> Bloquer</>
                              )}
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteEtablissement(e.id)}
                            title="Supprimer"
                          >
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </>
                  ) : (
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => handleRestoreEtablissement(e.id)}
                        className="bg-green-600 hover:bg-green-500 text-white"
                      >
                          <Unlock className="h-4 w-4 mr-1.5" /> Réintégrer l'établissement
                      </Button>
                  )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
