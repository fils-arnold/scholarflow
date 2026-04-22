from sqlalchemy import Boolean, Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
import datetime
from app.db.database import Base

class Etablissement(Base):
    __tablename__ = "etablissements"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String, unique=True, index=True)
    adresse = Column(String)
    telephone = Column(String)
    email_contact = Column(String)
    terms_of_use = Column(String, nullable=True) # Custom ToU for the establishment
    num_arrete_creation = Column(String)
    type_etablissement = Column(String)
    statut_juridique = Column(String)
    agrement_tutelle_academique = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    users = relationship("User", back_populates="etablissement")
    projects = relationship("Project", back_populates="etablissement")
