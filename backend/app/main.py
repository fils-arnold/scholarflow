from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, Base
from app.api.v1 import auth, etablissements, projects, tasks, applications, dashboard, users, moderation

# Create tables
Base.metadata.create_all(bind=engine)

# Seed creator account
from app.db.database import SessionLocal
from app.models.user import User, RoleEnum
from app.core.security import get_password_hash

from app.models.etablissement import Etablissement

def seed_data():
    db = SessionLocal()
    try:
        # Seed Super Admin
        creator = db.query(User).filter(User.email == "admin@scholarflow.com").first()
        if not creator:
            db.add(User(
                email="admin@scholarflow.com",
                password_hash=get_password_hash("admin123"),
                nom="SYSTEM",
                prenom="Admin",
                role=RoleEnum.creator
            ))

        # Seed Establishment & its Admin
        estab = db.query(Etablissement).filter(Etablissement.nom == "Université de Paris").first()
        if not estab:
            estab = Etablissement(nom="Université de Paris", code="UNIV-PARIS", adresse="Paris, France")
            db.add(estab)
            db.flush() # Get ID

        estab_admin = db.query(User).filter(User.email == "univ@univ.fr").first()
        if not estab_admin:
            db.add(User(
                email="univ@univ.fr",
                password_hash=get_password_hash("password123"),
                nom="ADMIN",
                prenom="Univ",
                role=RoleEnum.etablissement,
                etablissement_id=estab.id
            ))

        # Seed Teacher (for demo)
        teacher = db.query(User).filter(User.email == "teacher@univ.fr").first()
        if not teacher:
            db.add(User(
                email="teacher@univ.fr",
                password_hash=get_password_hash("password123"),
                nom="DURAND",
                prenom="Jean",
                role=RoleEnum.enseignant,
                etablissement_id=estab.id
            ))

        # Seed Student (for demo)
        student = db.query(User).filter(User.email == "student@univ.fr").first()
        if not student:
            db.add(User(
                email="student@univ.fr",
                password_hash=get_password_hash("password123"),
                nom="MARTIN",
                prenom="Alice",
                role=RoleEnum.etudiant,
                etablissement_id=estab.id
            ))
            
        db.commit()
    finally:
        db.close()

seed_data()

app = FastAPI(
    title="ScholarFlow API",
    description="Backend API for the ScholarFlow academic project management platform. Features include role-based access control, project lifecycle management, and collaborative task tracking.",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:5174",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(etablissements.router, prefix="/api/v1/etablissements", tags=["etablissements"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(applications.router, prefix="/api/v1/applications", tags=["applications"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(moderation.router, prefix="/api/v1/moderation", tags=["moderation"])
from app.api.v1 import analytics, messages, documents
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(messages.router, prefix="/api/v1/messages", tags=["messages"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])

@app.get("/")
def root():
    return {"message": "Welcome to ScholarFlow API"}
