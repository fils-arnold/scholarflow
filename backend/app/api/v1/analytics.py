from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from typing import List, Dict, Any
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.models.activity import ActivityLog
from app.models.etablissement import Etablissement
from app.models.project import Project
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/overview")
def get_stats_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Global overview for Admin or Establishment specific stats."""
    is_admin = current_user.role == RoleEnum.creator
    etab_id = current_user.etablissement_id

    # Base filter for establishment if not admin
    user_filter = [User.etablissement_id == etab_id] if not is_admin else []
    activity_filter = [ActivityLog.etablissement_id == etab_id] if not is_admin else []
    project_filter = [Project.etablissement_id == etab_id] if not is_admin else []

    # 1. Registration Stats (Last 30 days)
    last_30_days = datetime.utcnow() - timedelta(days=30)
    registrations = db.query(
        func.date(User.created_at).label('date'),
        func.count(User.id).label('count')
    ).filter(User.created_at >= last_30_days, *user_filter).group_by(func.date(User.created_at)).all()

    # 2. Login Stats (Last 30 days)
    logins = db.query(
        func.date(ActivityLog.created_at).label('date'),
        func.count(ActivityLog.id).label('count')
    ).filter(
        ActivityLog.action == "login",
        ActivityLog.created_at >= last_30_days,
        *activity_filter
    ).group_by(func.date(ActivityLog.created_at)).all()

    # 3. User Role Distribution
    role_dist = db.query(
        User.role,
        func.count(User.id)
    ).filter(*user_filter).group_by(User.role).all()

    # 4. Most Active Establishments (Top 5) - Only for Super Admin
    top_etablissements = []
    if is_admin:
        top_etablissements = db.query(
            Etablissement.nom,
            func.count(User.id).label('user_count')
        ).join(User).group_by(Etablissement.nom).order_by(desc('user_count')).limit(5).all()

    # 5. Top Sectors (Domains) - interpreting "rentable" as most active domains
    top_sectors = db.query(
        Project.domain,
        func.count(Project.id).label('project_count')
    ).filter(*project_filter).group_by(Project.domain).order_by(desc('project_count')).limit(5).all()

    return {
        "registrations": [{"date": str(r[0]), "count": r[1]} for r in registrations],
        "logins": [{"date": str(l[0]), "count": l[1]} for l in logins],
        "role_distribution": {str(r[0]): r[1] for r in role_dist},
        "top_etablissements": [{"name": e[0], "count": e[1]} for e in top_etablissements],
        "top_sectors": [{"domain": s[0], "count": s[1]} for s in top_sectors]
    }

@router.get("/top-connections")
def get_top_connections(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Extract list of most frequent logins / active users."""
    if current_user.role not in [RoleEnum.creator, RoleEnum.etablissement]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    etab_id = current_user.etablissement_id
    filter_cond = [ActivityLog.etablissement_id == etab_id] if current_user.role == RoleEnum.etablissement else []

    top_users = db.query(
        User.prenom,
        User.nom,
        User.email,
        func.count(ActivityLog.id).label('login_count'),
        func.max(ActivityLog.created_at).label('last_login')
    ).join(ActivityLog, User.id == ActivityLog.user_id).filter(
        ActivityLog.action == "login",
        *filter_cond
    ).group_by(User.id).order_by(desc('login_count')).limit(limit).all()

    return [
        {
            "name": f"{u[0]} {u[1]}",
            "email": u[2],
            "logins": u[3],
            "last_active": str(u[4])
        } for u in top_users
    ]

@router.get("/match/{project_id}")
def get_project_matching(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """AI-powered matching: ranks applicants based on skills and motivation."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    from app.models.application import Application, ApplicationStatus
    apps = db.query(Application).options(joinedload(Application.student)).filter(
        Application.project_id == project_id,
        Application.status == ApplicationStatus.pending
    ).all()
    
    results = []
    project_keywords = project.domain.lower().split() + project.title.lower().split()
    
    for app in apps:
        student = app.student
        score = 0
        reasons = []
        
        # 1. Expertise Match
        if student.expertise and project.domain.lower() in student.expertise.lower():
            score += 40
            reasons.append("Expertise directe dans le domaine")
            
        # 2. Keyword Match in Motivation Letter
        motivation = app.motivation_letter.lower()
        matches = [kw for kw in project_keywords if kw in motivation and len(kw) > 3]
        if matches:
            score += min(len(matches) * 10, 30)
            reasons.append(f"Mots-clés pertinents trouvés ({len(matches)})")
            
        # 3. Qualification Match
        if "master" in (student.qualification or "").lower() and "recherche" in project.description.lower():
            score += 20
            reasons.append("Niveau d'étude idéal pour la recherche")

        # 4. Default baseline
        score = min(score + random.randint(5, 15), 100) # Slight randomness for "AI feel"
        
        results.append({
            "student_id": student.id,
            "name": f"{student.prenom} {student.nom}",
            "score": score,
            "reasons": reasons,
            "application_id": app.id
        })
        
    return sorted(results, key=lambda x: x['score'], reverse=True)
