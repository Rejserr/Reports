from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import verify_password, create_access_token
from app.database import get_db
from app.models.user import User
from app.schemas.user import Token

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Pronalazak korisnika u bazi
    user = db.query(User).filter(User.Username == form_data.username).first()
    
    # Provjera postoji li korisnik i je li lozinka ispravna
    if not user or not verify_password(form_data.password, user.PasswordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Provjera je li korisnik aktivan
    if not user.IsActive:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Kreiranje access tokena
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.Username},
        expires_delta=access_token_expires
    )
    
    # Ažuriranje vremena zadnje prijave
    from datetime import datetime
    user.LastLogin = datetime.utcnow()
    db.commit()
    
    return {"access_token": access_token, "token_type": "bearer"}
