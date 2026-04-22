from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.database import Base

class RoleEnum(str, enum.Enum):
    creator = "creator"
    etablissement = "etablissement"
    enseignant = "enseignant"
    etudiant = "etudiant"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    nom = Column(String)
    prenom = Column(String)
    role = Column(Enum(RoleEnum), default=RoleEnum.etudiant)
    etablissement_id = Column(Integer, ForeignKey("etablissements.id"), nullable=True)
    matricule = Column(String, unique=True, nullable=True)
    qualification = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    expertise = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    is_photo_public = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    is_blocked = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    violation_reason = Column(String, nullable=True)
    violation_type = Column(String, nullable=True) # 'global' or 'local'
    blocked_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    notified_etablissement = Column(Boolean, default=False) # For Super Admin usage
    establishment_consent = Column(Boolean, default=False) # Consent for Super Admin to delete

    etablissement = relationship("Etablissement", back_populates="users")
    projects = relationship("Project", back_populates="creator", foreign_keys="[Project.creator_id]")
    applications = relationship("Application", back_populates="student")
    tasks_assigned = relationship("Task", back_populates="assignee")
