from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.task import TaskStatus

class TaskBase(BaseModel):
    titre: str
    description: Optional[str] = None
    statut: TaskStatus = TaskStatus.todo
    echeance: Optional[datetime] = None

class TaskCreate(TaskBase):
    assigne_a: Optional[int] = None

class TaskUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    statut: Optional[TaskStatus] = None
    echeance: Optional[datetime] = None
    assigne_a: Optional[int] = None

class Task(TaskBase):
    id: int
    project_id: int
    assigne_a: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
