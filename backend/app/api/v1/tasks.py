from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, RoleEnum
from app.models.task import Task
from app.models.project import Project
from app.schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate
from app.dependencies import get_current_user

router = APIRouter()

@router.get("/my_tasks", response_model=List[TaskSchema])
def get_my_tasks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.assigne_a == current_user.id).all()

@router.get("/project/{project_id}", response_model=List[TaskSchema])
def get_tasks_for_project(project_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Task).filter(Task.project_id == project_id).all()

@router.post("/project/{project_id}", response_model=TaskSchema)
def create_task(project_id: int, task_in: TaskCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project creator can add tasks")
        
    db_task = Task(**task_in.model_dump(), project_id=project_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.put("/{task_id}", response_model=TaskSchema)
def update_task(task_id: int, task_in: TaskUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = db.query(Project).filter(Project.id == db_task.project_id).first()
    if not project or project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project creator can modify tasks")
        
    for key, value in task_in.model_dump(exclude_unset=True).items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    return db_task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_task = db.query(Task).filter(Task.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    project = db.query(Project).filter(Project.id == db_task.project_id).first()
    if not project or project.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the project creator can delete tasks")
        
    db.delete(db_task)
    db.commit()
    return {"detail": "Task deleted"}
