from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import User as UserSchema
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/users", response_model=List[UserSchema])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).options(joinedload(User.etablissement)).filter(User.is_deleted == False)
    
    if current_user.role == RoleEnum.etablissement:
        query = query.filter(User.etablissement_id == current_user.etablissement_id)
        
    return query.all()

@router.get("/violations", response_model=List[UserSchema])
def list_violations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).options(joinedload(User.etablissement)).filter(User.violation_reason != None, User.is_deleted == False)
    
    if current_user.role == RoleEnum.creator:
        query = query.filter(User.violation_type == "global")
    elif current_user.role == RoleEnum.etablissement:
        query = query.filter(User.etablissement_id == current_user.etablissement_id)
    else:
        raise HTTPException(status_code=403, detail="Accès non autorisé.")
        
    return query.all()

@router.get("/archive", response_model=List[UserSchema])
def list_archive(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(User).options(joinedload(User.etablissement)).filter((User.is_blocked == True) | (User.is_deleted == True))
    
    if current_user.role == RoleEnum.etablissement:
        query = query.filter(User.etablissement_id == current_user.etablissement_id)
    elif current_user.role != RoleEnum.creator:
        raise HTTPException(status_code=403, detail="Accès non autorisé.")
        
    return query.all()

@router.post("/report/{user_id}")
def report_user(
    user_id: int,
    reason: str = Body(..., embed=True),
    violation_type: str = Body("local", embed=True), # Default to local
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    
    if current_user.role == RoleEnum.creator:
        target_user.violation_type = "global"
    elif current_user.role == RoleEnum.etablissement:
        if target_user.etablissement_id != current_user.etablissement_id:
            raise HTTPException(status_code=403, detail="Pas autorisé.")
        target_user.violation_type = violation_type # Can be local or global depending on severity
    else:
        raise HTTPException(status_code=403, detail="Accès non autorisé.")

    target_user.violation_reason = reason
    db.commit()
    return {"message": "Utilisateur signalé."}

@router.post("/consent/{user_id}")
def give_consent(
    user_id: int,
    consent: bool = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != RoleEnum.etablissement:
        raise HTTPException(status_code=403, detail="Seul l'établissement peut donner son accord.")
    
    target_user = db.query(User).filter(User.id == user_id, User.etablissement_id == current_user.etablissement_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    
    target_user.establishment_consent = consent
    db.commit()
    return {"message": "Consentement mis à jour."}

@router.post("/block/{user_id}")
def block_user(
    user_id: int,
    action: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    if current_user.role == RoleEnum.etablissement:
        if target_user.etablissement_id != current_user.etablissement_id:
            raise HTTPException(status_code=403, detail="Action non autorisée.")
    elif current_user.role == RoleEnum.creator:
        # Super Admin only blocks for GLOBAL violations or CONSENT
        if target_user.violation_type != "global" and not target_user.establishment_consent:
            raise HTTPException(status_code=403, detail="Le Super Admin gère uniquement les fraudes globales ou les cas avec accord établissement.")
    else:
        raise HTTPException(status_code=403, detail="Accès refusé.")

    if action == "block":
        target_user.is_blocked = True
    elif action == "delete":
        target_user.is_deleted = True
    
    target_user.blocked_by_id = current_user.id
    db.commit()
    return {"message": f"Utilisateur {action}é."}

@router.post("/reintegrate/{user_id}")
def reintegrate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    # Strict Rule: Only the authority that blocked the user can reintegrate them.
    # Super Admin cannot reintegrate if Blocked by Establishment.
    # Establishment cannot reintegrate if Blocked by Super Admin.
    
    if target_user.blocked_by_id != current_user.id:
        blocker = db.query(User).filter(User.id == target_user.blocked_by_id).first()
        blocker_name = blocker.nom if blocker else "un autre administrateur"
        raise HTTPException(
            status_code=403, 
            detail=f"Action refusée. Seul l'auteur du blocage ({blocker_name}) peut réintégrer cet utilisateur."
        )

    target_user.is_blocked = False
    target_user.is_deleted = False
    target_user.violation_reason = None
    target_user.violation_type = None
    target_user.blocked_by_id = None
    target_user.establishment_consent = False
    db.commit()
    return {"message": "Utilisateur réintégré avec succès."}
