from sqlalchemy import Column, ForeignKey, Integer, String, Enum, DateTime, Text, Boolean, Table
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.database import Base

class ProjectStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    completed = "completed"

# Join table for invited teachers (collaborators)
project_collaborators = Table(
    "project_collaborators",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    domain = Column(String)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.open)
    spots = Column(Integer, default=1)
    spots_remaining = Column(Integer, default=1)
    creator_id = Column(Integer, ForeignKey("users.id"))
    etablissement_id = Column(Integer, ForeignKey("etablissements.id"))
    leader_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    deadline = Column(DateTime)
    is_private = Column(Boolean, default=False)
    is_special = Column(Boolean, default=False)
    is_student_project = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    creator = relationship("User", back_populates="projects", foreign_keys=[creator_id])
    leader = relationship("User", foreign_keys=[leader_id])
    etablissement = relationship("Etablissement", back_populates="projects")
    applications = relationship("Application", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    
    # Many-to-many relationship for invited teachers
    collaborators = relationship("User", secondary=project_collaborators, backref="collaborating_on")
