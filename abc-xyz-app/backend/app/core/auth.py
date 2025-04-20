from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData
from typing import Optional

# OAuth2 scheme za autentikaciju
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

# Funkcija za dobivanje trenutnog korisnika
async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        # Dekodiranje JWT tokena
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Dohvaćanje korisnika iz baze
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# Funkcija za dobivanje trenutnog aktivnog korisnika
async def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Funkcija za provjeru je li korisnik admin
def is_admin(user: User) -> bool:
    return user.role == "Admin"

# Funkcija za dobivanje trenutnog admin korisnika
async def get_current_admin_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    if not is_admin(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user
