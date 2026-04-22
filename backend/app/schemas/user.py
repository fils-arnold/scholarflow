from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.user import RoleEnum

class EtablissementMin(BaseModel):
    id: int
    nom: str
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: EmailStr
    nom: str
    prenom: str
    role: RoleEnum = RoleEnum.etudiant
    etablissement_id: Optional[int] = None
    matricule: Optional[str] = None
    qualification: Optional[str] = None
    grade: Optional[str] = None
    expertise: Optional[str] = None
    photo_url: Optional[str] = None
    is_photo_public: Optional[bool] = True
    is_blocked: bool = False
    is_deleted: bool = False
    violation_reason: Optional[str] = None
    violation_type: Optional[str] = None
    blocked_by_id: Optional[int] = None
    notified_etablissement: bool = False
    establishment_consent: bool = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    nom: str
    prenom: str
    role: RoleEnum
    etablissement_id: Optional[int] = None
    matricule: Optional[str] = None
    # Registration fields for Etablissement
    nom_etablissement: Optional[str] = None
    num_arrete_creation: Optional[str] = None
    type_etablissement: Optional[str] = None
    statut_juridique: Optional[str] = None
    adresse_etablissement: Optional[str] = None
    telephone_etablissement: Optional[str] = None

class UserUpdate(BaseModel):
    nom: Optional[str] = None
    prenom: Optional[str] = None
    etablissement_id: Optional[int] = None
    qualification: Optional[str] = None
    grade: Optional[str] = None
    expertise: Optional[str] = None
    photo_url: Optional[str] = None
    is_photo_public: Optional[bool] = None

class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    etablissement: Optional[EtablissementMin] = None

    class Config:
        from_attributes = True
