from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import User as UserSchema, UserUpdate
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Super Admin sees ALL users
    if current_user.role == RoleEnum.creator:
        return db.query(User).all()
    # Establishment, Teacher, Student see ONLY their own establishment users
    return db.query(User).filter(User.etablissement_id == current_user.etablissement_id).all()

@router.get("/me", response_model=UserSchema)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserSchema)
def update_user_me(user_in: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    for key, value in user_in.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
        
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/{user_id}/status")
def update_user_status(
    user_id: int, 
    status_update: dict, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Only creator or etablissement can manage users
    if current_user.role not in [RoleEnum.creator, RoleEnum.etablissement]:
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    # Check if etablissement admin belongs to the same etablissement
    if current_user.role == RoleEnum.etablissement and target_user.etablissement_id != current_user.etablissement_id:
        raise HTTPException(status_code=403, detail="Cet utilisateur n'appartient pas à votre établissement")

    if "is_blocked" in status_update:
        target_user.is_blocked = status_update["is_blocked"]
        if target_user.is_blocked:
            target_user.blocked_by_id = current_user.id
            
    if "is_deleted" in status_update:
        target_user.is_deleted = status_update["is_deleted"]
        
    db.commit()
    db.refresh(target_user)
    return target_user
