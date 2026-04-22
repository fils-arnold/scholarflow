from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    uploader_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    file_url = Column(String)
    file_type = Column(String) # pdf, docx, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    project = relationship("Project")
    uploader = relationship("User")
