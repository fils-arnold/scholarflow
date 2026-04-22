from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.models.document import Document
from app.models.project import Project
from pydantic import BaseModel
from datetime import datetime
from app.dependencies import get_current_user

router = APIRouter()

class DocumentSchema(BaseModel):
    id: int
    title: str
    file_url: str
    file_type: str
    uploader_name: str
    created_at: datetime

class DocumentCreate(BaseModel):
    title: str
    file_url: str
    file_type: str

@router.get("/{project_id}", response_model=List[DocumentSchema])
def get_documents(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    docs = db.query(Document).options(joinedload(Document.uploader)).filter(Document.project_id == project_id).all()
    return [
        DocumentSchema(
            id=d.id,
            title=d.title,
            file_url=d.file_url,
            file_type=d.file_type,
            uploader_name=f"{d.uploader.prenom} {d.uploader.nom}",
            created_at=d.created_at
        ) for d in docs
    ]

@router.post("/{project_id}", response_model=DocumentSchema)
def upload_document(project_id: int, doc_in: DocumentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_doc = Document(
        project_id=project_id,
        uploader_id=current_user.id,
        **doc_in.model_dump()
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return DocumentSchema(
        id=db_doc.id,
        title=db_doc.title,
        file_url=db_doc.file_url,
        file_type=db_doc.file_type,
        uploader_name=f"{current_user.prenom} {current_user.nom}",
        created_at=db_doc.created_at
    )
