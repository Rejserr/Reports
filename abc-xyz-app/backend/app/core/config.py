import os
from pydantic import BaseSettings
from dotenv import load_dotenv

# Učitavanje varijabli okruženja iz .env datoteke
load_dotenv()

class Settings(BaseSettings):
    # Postavke aplikacije
    APP_NAME: str = os.getenv("APP_NAME", "ABC-XYZ Analysis")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt-tokens")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Postavke baze podataka
    DB_DRIVER: str = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
    DB_SERVER: str = os.getenv("DB_SERVER", "ft-AppServer01\\SQLEXPRESS")
    DB_NAME: str = os.getenv("DB_NAME", "Reports")
    DB_USER: str = os.getenv("DB_USER", "")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "")
    DB_TRUSTED_CONNECTION: bool = os.getenv("DB_TRUSTED_CONNECTION", "True").lower() == "true"
    
    # Postavke za CORS
    CORS_ORIGINS: list = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"

settings = Settings()
