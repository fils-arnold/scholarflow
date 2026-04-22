from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from app.db.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    etablissement_id = Column(Integer, ForeignKey("etablissements.id"), nullable=True)
    action = Column(String) # login, register, project_create, etc.
    details = Column(JSON, nullable=True) # Browser, IP, context
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User")
    etablissement = relationship("Etablissement")
