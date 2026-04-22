from sqlalchemy import Column, ForeignKey, Integer, String, Enum, DateTime, Text
from sqlalchemy.orm import relationship
import enum
import datetime
from app.db.database import Base

class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    invited = "invited"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"))
    project_id = Column(Integer, ForeignKey("projects.id"))
    motivation_letter = Column(Text)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.pending)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    student = relationship("User", back_populates="applications")
    project = relationship("Project", back_populates="applications")
