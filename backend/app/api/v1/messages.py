from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db.database import get_db
from app.models.user import User
from app.models.message import Message
from app.models.application import Application, ApplicationStatus
from app.models.project import Project
from pydantic import BaseModel
from datetime import datetime
from app.dependencies import get_current_user

router = APIRouter()

class MessageSchema(BaseModel):
    id: int
    project_id: int
    sender_id: int
    content: str
    created_at: datetime
    sender_name: str

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

@router.get("/{project_id}", response_model=List[MessageSchema])
def get_messages(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if user is part of the project or establishment
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    is_member = db.query(Application).filter(
        Application.project_id == project_id,
        Application.student_id == current_user.id,
        Application.status == ApplicationStatus.accepted
    ).first()

    if not is_member and project.creator_id != current_user.id and current_user.etablissement_id != project.etablissement_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    messages = db.query(Message).options(joinedload(Message.sender)).filter(Message.project_id == project_id).order_by(Message.created_at.asc()).all()
    
    return [
        MessageSchema(
            id=m.id,
            project_id=m.project_id,
            sender_id=m.sender_id,
            content=m.content,
            created_at=m.created_at,
            sender_name=f"{m.sender.prenom} {m.sender.nom}"
        ) for m in messages
    ]

@router.post("/{project_id}", response_model=MessageSchema)
def send_message(project_id: int, msg_in: MessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Authorization check (same as GET)
    project = db.query(Project).filter(Project.id == project_id).first()
    is_member = db.query(Application).filter(
        Application.project_id == project_id,
        Application.student_id == current_user.id,
        Application.status == ApplicationStatus.accepted
    ).first()

    if not is_member and project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    db_msg = Message(
        project_id=project_id,
        sender_id=current_user.id,
        content=msg_in.content
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    return MessageSchema(
        id=db_msg.id,
        project_id=db_msg.project_id,
        sender_id=db_msg.sender_id,
        content=db_msg.content,
        created_at=db_msg.created_at,
        sender_name=f"{current_user.prenom} {current_user.nom}"
    )
