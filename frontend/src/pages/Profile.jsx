import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Common/Card';
import { Button } from '../components/Common/Button';
import { Input } from '../components/Common/Input';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Briefcase, GraduationCap, Building, Edit2, Save, X } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

export function Profile() {
  const { user, login } = useAuth(); // login function saves the new user state if we pass data to it
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    qualification: '',
    grade: '',
    expertise: '',
    photo_url: '',
    is_photo_public: true
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        qualification: user.qualification || '',
        grade: user.grade || '',
        expertise: user.expertise || '',
        photo_url: user.photo_url || '',
        is_photo_public: user.is_photo_public !== false // defaults to true
      });
    }
  }, [user]);

  const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) { // 5MB limit before compression
              toast.error("L'image est trop volumineuse (max 5MB).");
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  const MAX_WIDTH = 256;
                  const MAX_HEIGHT = 256;
                  let width = img.width;
                  let height = img.height;

                  if (width > height) {
                      if (width > MAX_WIDTH) {
                          height *= MAX_WIDTH / width;
                          width = MAX_WIDTH;
                      }
                  } else {
                      if (height > MAX_HEIGHT) {
                          width *= MAX_HEIGHT / height;
                          height = MAX_HEIGHT;
                      }
                  }
                  canvas.width = width;
                  canvas.height = height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(img, 0, 0, width, height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                  setFormData(prev => ({ ...prev, photo_url: dataUrl }));
              };
              img.src = reader.result;
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...formData };
      if (payload.photo_url === user.photo_url) {
          delete payload.photo_url; // Don't send large base64 if unchanged
      }
      const { data } = await api.put('/users/me', payload);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success("Profil mis à jour avec succès");
      setIsEditing(false);
      window.location.reload(); 
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mon Profil</h2>
          <p className="text-muted-foreground">Gérez vos informations personnelles et académiques.</p>
        </div>
        {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" /> Modifier le profil
            </Button>
        )}
      </div>

      <Card>
        <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center gap-4">
                <div className="relative h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-background shadow-sm overflow-hidden">
                    {user.photo_url ? (
                        <img src={user.photo_url} alt="Profil" className="h-full w-full object-cover" />
                    ) : (
                        <>{user.prenom?.[0]}{user.nom?.[0]}</>
                    )}
                </div>
                <div>
                    <CardTitle className="text-2xl">{(user.prenom || '').toLowerCase()} {(user.nom || '').toUpperCase()}</CardTitle>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <span className="capitalize font-medium">{user.role}</span>
                        {user.etablissement && (
                            <>
                                <span>•</span>
                                <span className="flex items-center"><Building className="h-3.5 w-3.5 mr-1" /> {user.etablissement.nom}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </CardHeader>
        <CardContent className="pt-6">
            {!isEditing ? (
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations Personnelles</h4>
                        
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Email</div>
                            <div className="flex items-center font-medium"><Mail className="h-4 w-4 mr-2 text-primary" /> {user.email}</div>
                        </div>
                        
                        {(user.matricule) && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Matricule</div>
                                <div className="font-medium">{user.matricule}</div>
                            </div>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informations Académiques</h4>
                        
                        {(user.role === 'enseignant' || user.role === 'etudiant') && (
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Qualification / Niveau</div>
                                <div className="flex items-center font-medium">
                                    <GraduationCap className="h-4 w-4 mr-2 text-primary" /> 
                                    {user.qualification || 'Non spécifié'}
                                </div>
                            </div>
                        )}
                        
                        {user.role === 'enseignant' && (
                            <>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Grade</div>
                                    <div className="flex items-center font-medium">
                                        <Briefcase className="h-4 w-4 mr-2 text-primary" /> 
                                        {user.grade || 'Non spécifié'}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm text-muted-foreground mb-1">Domaine d'expertise</div>
                                    <div className="font-medium">{user.expertise || 'Non spécifié'}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Identité</h4>
                            <div>
                                <label className="block text-sm font-medium mb-1">Prénom</label>
                                <Input required value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Nom</label>
                                <Input required value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
                            </div>
                            
                            <div className="pt-2">
                                <label className="block text-sm font-medium mb-2">Photo de profil</label>
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-muted overflow-hidden border">
                                        {formData.photo_url ? (
                                            <img src={formData.photo_url} alt="Aperçu" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-muted-foreground"><User className="h-8 w-8" /></div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <Input type="file" accept="image/*" onChange={handlePhotoUpload} className="text-sm" />
                                        <label className="flex items-center gap-2 text-sm cursor-pointer mt-2">
                                            <input 
                                                type="checkbox" 
                                                checked={formData.is_photo_public} 
                                                onChange={(e) => setFormData({...formData, is_photo_public: e.target.checked})}
                                                className="rounded text-primary focus:ring-primary h-4 w-4"
                                            />
                                            <span>Rendre ma photo visible par les autres utilisateurs</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(user.role === 'enseignant' || user.role === 'etudiant') && (
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Académique</h4>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Qualification / Niveau</label>
                                    <Input value={formData.qualification} onChange={e => setFormData({...formData, qualification: e.target.value})} />
                                </div>
                                
                                {user.role === 'enseignant' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Grade</label>
                                            <Input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Expertise</label>
                                            <Input value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})} />
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4 mr-2" /> Annuler
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Enregistrement...' : <><Save className="h-4 w-4 mr-2" /> Enregistrer</>}
                        </Button>
                    </div>
                </form>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
