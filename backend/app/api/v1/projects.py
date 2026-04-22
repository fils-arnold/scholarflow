from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.models.project import Project, ProjectStatus
from app.schemas.project import Project as ProjectSchema, ProjectCreate, ProjectUpdate
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ProjectSchema])
def get_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.creator:
        return db.query(Project).filter(Project.creator_id == current_user.id).all()
        
    query = db.query(Project).filter(Project.etablissement_id == current_user.etablissement_id)
    
    from app.models.application import Application, ApplicationStatus
    invited_project_ids = [
        app.project_id for app in db.query(Application).filter(
            Application.student_id == current_user.id, 
            Application.status == ApplicationStatus.invited
        ).all()
    ]
    
    if current_user.role == RoleEnum.etudiant:
        return query.filter(
            (Project.is_student_project == False) | 
            (Project.creator_id == current_user.id) |
            (Project.id.in_(invited_project_ids))
        ).all()
    elif current_user.role == RoleEnum.enseignant:
        # Teachers only see their own projects or where they are invited as collaborators
        return query.filter(
            (Project.creator_id == current_user.id) |
            (Project.collaborators.any(id=current_user.id))
        ).all()
    elif current_user.role == RoleEnum.etablissement:
        return query.all()
    
    return []

@router.post("/{project_id}/collaborators/{teacher_id}", response_model=ProjectSchema)
def add_collaborator(project_id: int, teacher_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can invite collaborators")
    
    teacher = db.query(User).filter(User.id == teacher_id, User.role == RoleEnum.enseignant).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if teacher not in project.collaborators:
        project.collaborators.append(teacher)
        db.commit()
    
    return project

@router.delete("/{project_id}/collaborators/{teacher_id}", response_model=ProjectSchema)
def remove_collaborator(project_id: int, teacher_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the creator can remove collaborators")
    
    teacher = db.query(User).filter(User.id == teacher_id).first()
    if teacher in project.collaborators:
        project.collaborators.remove(teacher)
        db.commit()
    
    return project

@router.post("/", response_model=ProjectSchema)
def create_project(project_in: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role == RoleEnum.creator:
        raise HTTPException(status_code=403, detail="Creator cannot create projects")
        
    is_student_project = (current_user.role == RoleEnum.etudiant)
    is_special = (current_user.role == RoleEnum.etablissement)
        
    db_project = Project(
        **project_in.model_dump(),
        creator_id=current_user.id,
        etablissement_id=current_user.etablissement_id,
        status=ProjectStatus.open,
        spots_remaining=project_in.spots,
        is_student_project=is_student_project,
        is_special=is_special
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if current_user.role == RoleEnum.creator:
        if db_project.creator_id != current_user.id:
            raise HTTPException(status_code=403, detail="Super Admin cannot view user projects")
    elif db_project.etablissement_id != current_user.etablissement_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
        
    return db_project

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(project_id: int, project_in: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if db_project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the author can modify this project")
        
    for key, value in project_in.model_dump(exclude_unset=True).items():
        setattr(db_project, key, value)
        
    db.commit()
    db.refresh(db_project)
    return db_project

@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_project = db.query(Project).filter(Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if db_project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the author can delete this project")
        
    db.delete(db_project)
    db.commit()
    return {"detail": "Project deleted"}

