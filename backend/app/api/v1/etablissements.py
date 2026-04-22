from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.etablissement import Etablissement
from app.schemas.etablissement import Etablissement as EtablissementSchema

router = APIRouter()

@router.get("/", response_model=List[EtablissementSchema])
def list_etablissements(db: Session = Depends(get_db)):
    return db.query(Etablissement).all()

@router.get("/{etab_id}", response_model=EtablissementSchema)
def get_etablissement(etab_id: int, db: Session = Depends(get_db)):
    etab = db.query(Etablissement).filter(Etablissement.id == etab_id).first()
    if not etab:
        raise HTTPException(status_code=404, detail="Établissement non trouvé.")
    return etab
