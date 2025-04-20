from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.ext.declarative import declarative_base
from app.database import Base

class User(Base):
    __tablename__ = "AppUsers"
    
    UserID = Column(Integer, primary_key=True, index=True)
    Username = Column(String(50), unique=True, index=True, nullable=False)
    PasswordHash = Column(String(100), nullable=False)
    Email = Column(String(100), unique=True, index=True)
    FullName = Column(String(100))
    Role = Column(String(20), nullable=False)
    IsActive = Column(Boolean, default=True)
    LastLogin = Column(DateTime)
    CreatedDate = Column(DateTime, default=func.now())
    
    # Svojstva za lakši pristup
    @property
    def id(self):
        return self.UserID
    
    @property
    def username(self):
        return self.Username
    
    @property
    def email(self):
        return self.Email
    
    @property
    def full_name(self):
        return self.FullName
    
    @property
    def role(self):
        return self.Role
    
    @property
    def is_active(self):
        return self.IsActive
