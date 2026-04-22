from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.application import ApplicationStatus
from app.schemas.user import User as UserSchema
from app.schemas.project import Project

class ApplicationBase(BaseModel):
    motivation_letter: str

class ApplicationCreate(ApplicationBase):
    project_id: int

class ApplicationUpdate(BaseModel):
    status: ApplicationStatus

class Application(ApplicationBase):
    id: int
    student_id: int
    project_id: int
    status: ApplicationStatus
    created_at: datetime
    updated_at: datetime
    reviewed_at: Optional[datetime] = None
    student: Optional[UserSchema] = None
    project: Optional[Project] = None

    class Config:
        from_attributes = True
