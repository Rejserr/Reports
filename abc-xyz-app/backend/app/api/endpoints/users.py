from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_admin_user, get_current_active_user
from app.core.security import get_password_hash
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate, User as UserSchema

router = APIRouter()

@router.get("/me", response_model=UserSchema)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    """
    Dohvaća podatke o trenutno prijavljenom korisniku.
    """
    return current_user

@router.get("/", response_model=List[UserSchema])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Dohvaća listu svih korisnika. Samo za administratore.
    """
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=UserSchema, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Kreira novog korisnika. Samo za administratore.
    """
    # Provjera postoji li već korisnik s istim korisničkim imenom
    db_user = db.query(User).filter(User.Username == user_in.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Kreiranje novog korisnika
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        Username=user_in.username,
        PasswordHash=hashed_password,
        Email=user_in.email,
        FullName=user_in.full_name,
        Role=user_in.role,
        IsActive=user_in.is_active
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.put("/{user_id}", response_model=UserSchema)
async def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Ažurira postojećeg korisnika. Samo za administratore.
    """
    # Dohvaćanje korisnika iz baze
    db_user = db.query(User).filter(User.UserID == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Ažuriranje podataka korisnika
    if user_in.email is not None:
        db_user.Email = user_in.email
    if user_in.full_name is not None:
        db_user.FullName = user_in.full_name
    if user_in.password is not None:
        db_user.PasswordHash = get_password_hash(user_in.password)
    if user_in.role is not None:
        db_user.Role = user_in.role
    if user_in.is_active is not None:
        db_user.IsActive = user_in.is_active
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Briše korisnika. Samo za administratore.
    """
    # Dohvaćanje korisnika iz baze
    db_user = db.query(User).filter(User.UserID == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Brisanje korisnika
    db.delete(db_user)
    db.commit()
    
    return None
