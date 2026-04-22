from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.models.application import Application, ApplicationStatus
from app.models.project import Project
from app.schemas.application import Application as ApplicationSchema, ApplicationCreate, ApplicationUpdate
from app.dependencies import get_current_user
from app.services.email_service import send_application_notification, send_status_update_notification

router = APIRouter()

@router.get("/", response_model=List[ApplicationSchema])
def get_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.etudiant:
        return db.query(Application).filter(Application.student_id == current_user.id).all()
    elif current_user.role == RoleEnum.enseignant:
        # Teachers see applications for their projects
        projects = db.query(Project.id).filter(Project.creator_id == current_user.id).subquery()
        return db.query(Application).filter(Application.project_id.in_(projects)).all()
    raise HTTPException(status_code=403, detail="Not authorized")

@router.get("/project/{project_id}", response_model=List[ApplicationSchema])
def get_project_applications(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role not in [RoleEnum.creator, RoleEnum.etablissement] and project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    return db.query(Application).filter(Application.project_id == project_id).all()

@router.post("/", response_model=ApplicationSchema)
def create_application(app_in: ApplicationCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != RoleEnum.etudiant:
        raise HTTPException(status_code=403, detail="Only students can apply")
        
    db_app = Application(
        **app_in.model_dump(),
        student_id=current_user.id,
        status=ApplicationStatus.pending
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    
    # Notify teacher (simulated)
    project = db.query(Project).filter(Project.id == db_app.project_id).first()
    teacher = db.query(User).filter(User.id == project.creator_id).first()
    if teacher:
        send_application_notification(
            teacher_email=teacher.email,
            student_name=f"{current_user.prenom} {current_user.nom}",
            project_title=project.title
        )
        
    return db_app

@router.put("/{app_id}", response_model=ApplicationSchema)
def update_application(app_id: int, app_in: ApplicationUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_app = db.query(Application).filter(Application.id == app_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    project = db.query(Project).filter(Project.id == db_app.project_id).first()
    if current_user.role not in [RoleEnum.creator, RoleEnum.etablissement] and project.creator_id != current_user.id:
         raise HTTPException(status_code=403, detail="Not authorized to review this application")
         
    db_app.status = app_in.status
    db_app.reviewed_at = datetime.now()
    
    # Update project spots if accepted
    if app_in.status == ApplicationStatus.accepted:
        project = db.query(Project).filter(Project.id == db_app.project_id).first()
        if project and project.spots_remaining > 0:
            project.spots_remaining -= 1
            
    db.commit()
    db.refresh(db_app)
    
    # Notify student (simulated)
    student = db.query(User).filter(User.id == db_app.student_id).first()
    if student:
        send_status_update_notification(
            student_email=student.email,
            project_title=project.title,
            status=app_in.status
        )
        
    return db_app
