from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.models.project import Project
from app.models.application import Application
from app.models.etablissement import Etablissement
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/")
def get_dashboard_stats(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    stats = {}
    if current_user.role == RoleEnum.creator:
        stats['total_etablissements'] = db.query(func.count(Etablissement.id)).scalar()
        stats['total_users'] = db.query(func.count(User.id)).scalar()
    elif current_user.role == RoleEnum.etablissement:
        stats['total_teachers'] = db.query(func.count(User.id)).filter(User.etablissement_id == current_user.etablissement_id, User.role == RoleEnum.enseignant).scalar()
        stats['total_students'] = db.query(func.count(User.id)).filter(User.etablissement_id == current_user.etablissement_id, User.role == RoleEnum.etudiant).scalar()
        stats['total_projects'] = db.query(func.count(Project.id)).filter(Project.etablissement_id == current_user.etablissement_id).scalar()
    elif current_user.role == RoleEnum.enseignant:
        stats['total_projects'] = db.query(func.count(Project.id)).filter(Project.creator_id == current_user.id).scalar()
        # stats['pending_applications'] = ... (can be computed similarly)
    elif current_user.role == RoleEnum.etudiant:
        stats['total_applications'] = db.query(func.count(Application.id)).filter(Application.student_id == current_user.id).scalar()
    return stats
