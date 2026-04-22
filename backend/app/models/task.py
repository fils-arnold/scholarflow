from sqlalchemy import Column, ForeignKey, Integer, String, Enum, DateTime, Text
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.database import Base

class TaskStatus(str, enum.Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    titre = Column(String)
    description = Column(Text, nullable=True)
    assigne_a = Column(Integer, ForeignKey("users.id"), nullable=True)
    statut = Column(Enum(TaskStatus), default=TaskStatus.todo)
    echeance = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks_assigned")
