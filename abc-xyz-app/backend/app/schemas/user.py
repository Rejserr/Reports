from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Bazna shema za korisnika
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: str = "Viewer"
    is_active: bool = True

# Shema za kreiranje korisnika
class UserCreate(UserBase):
    password: str

# Shema za ažuriranje korisnika
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# Shema za prikaz korisnika
class User(UserBase):
    id: int
    last_login: Optional[datetime] = None
    created_date: datetime
    
    class Config:
        orm_mode = True

# Shema za token
class Token(BaseModel):
    access_token: str
    token_type: str

# Shema za podatke u tokenu
class TokenData(BaseModel):
    username: Optional[str] = None
