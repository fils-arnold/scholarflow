from pydantic import BaseModel
from typing import Optional
from app.schemas.user import User

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginResponse(BaseModel):
    token: Token
    user: User
