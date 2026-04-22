from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EtablissementBase(BaseModel):
    nom: str
    adresse: str
    telephone: str
    email_contact: str
    num_arrete_creation: str
    type_etablissement: str
    statut_juridique: str
    terms_of_use: Optional[str] = None
    agrement_tutelle_academique: Optional[str] = None
    is_active: bool = True
    is_blocked: bool = False

class EtablissementCreate(EtablissementBase):
    pass

class EtablissementUpdate(BaseModel):
    nom: Optional[str] = None
    adresse: Optional[str] = None
    telephone: Optional[str] = None
    email_contact: Optional[str] = None
    num_arrete_creation: Optional[str] = None
    type_etablissement: Optional[str] = None
    statut_juridique: Optional[str] = None
    agrement_tutelle_academique: Optional[str] = None
    is_active: Optional[bool] = None
    is_blocked: Optional[bool] = None

class Etablissement(EtablissementBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
