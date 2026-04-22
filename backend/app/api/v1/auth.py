from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.schemas.user import UserCreate, User as UserSchema
from app.schemas.auth import Token, LoginResponse
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

from app.models.etablissement import Etablissement

@router.post("/register", response_model=UserSchema)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    etablissement_id = None

    if user_in.role == RoleEnum.etablissement:
        # Create new Etablissement
        required_fields = [
            user_in.nom_etablissement, user_in.num_arrete_creation, 
            user_in.type_etablissement, user_in.statut_juridique, 
            user_in.adresse_etablissement, user_in.telephone_etablissement
        ]
        if not all(required_fields):
            raise HTTPException(status_code=400, detail="Tous les champs de l'établissement sont requis (nom, arrêté, type, statut, adresse, téléphone).")
        
        existing_ecole = db.query(Etablissement).filter(Etablissement.nom == user_in.nom_etablissement).first()
        if existing_ecole:
            raise HTTPException(status_code=400, detail="Cet établissement existe déjà")
            
        new_ecole = Etablissement(
            nom=user_in.nom_etablissement,
            num_arrete_creation=user_in.num_arrete_creation,
            type_etablissement=user_in.type_etablissement,
            statut_juridique=user_in.statut_juridique,
            adresse=user_in.adresse_etablissement,
            telephone=user_in.telephone_etablissement,
            terms_of_use="Règlement Standard ScholarFlow :\n1. Respect mutuel et intégrité académique.\n2. Usage responsable des ressources numériques.\n3. Conformité aux règles globales de la plateforme."
        )
        db.add(new_ecole)
        db.commit()
        db.refresh(new_ecole)
        etablissement_id = new_ecole.id

    elif user_in.role in [RoleEnum.etudiant, RoleEnum.enseignant]:
        if not user_in.etablissement_nom:
            raise HTTPException(status_code=400, detail="Veuillez spécifier votre établissement")
            
        ecole = db.query(Etablissement).filter(Etablissement.nom == user_in.etablissement_nom).first()
        if not ecole:
            raise HTTPException(status_code=400, detail="Établissement non trouvé. L'établissement doit s'inscrire en premier.")
        etablissement_id = ecole.id

    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        password_hash=hashed_password,
        nom=user_in.nom,
        prenom=user_in.prenom,
        role=user_in.role,
        etablissement_id=etablissement_id,
        matricule=user_in.matricule,
        qualification=user_in.qualification,
        grade=user_in.grade,
        expertise=user_in.expertise
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.post("/login", response_model=LoginResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.is_deleted:
        raise HTTPException(status_code=403, detail="Ce compte a été supprimé.")
    
    if user.is_blocked:
        raise HTTPException(
            status_code=403, 
            detail=f"Votre compte est bloqué. Motif : {user.violation_reason or 'Non spécifié'}. Veuillez contacter votre établissement."
        )
    
    access_token = create_access_token(data={"sub": user.email})
    
    # Log the activity
    from app.models.activity import ActivityLog
    db_log = ActivityLog(
        user_id=user.id,
        etablissement_id=user.etablissement_id,
        action="login"
    )
    db.add(db_log)
    db.commit()

    return {
        "token": {"access_token": access_token, "token_type": "bearer"},
        "user": user
    }
