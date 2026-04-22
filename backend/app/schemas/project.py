from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.project import ProjectStatus
from app.schemas.user import User as UserSchema

class ProjectBase(BaseModel):
    title: str
    description: str
    domain: str
    spots: int
    deadline: datetime

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    domain: Optional[str] = None
    spots: Optional[int] = None
    status: Optional[ProjectStatus] = None
    deadline: Optional[datetime] = None
    leader_id: Optional[int] = None

class Project(ProjectBase):
    id: int
    status: ProjectStatus
    spots_remaining: int
    creator_id: int
    etablissement_id: Optional[int] = None
    leader_id: Optional[int] = None
    is_private: bool = False
    is_special: bool = False
    is_student_project: bool = False
    is_flagged: bool = False
    created_at: datetime
    updated_at: datetime
    creator: Optional[UserSchema] = None
    collaborators: List[UserSchema] = []

    class Config:
        from_attributes = True
