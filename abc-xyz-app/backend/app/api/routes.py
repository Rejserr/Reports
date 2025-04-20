from fastapi import APIRouter
from app.api.endpoints import analysis, auth, configurations, dashboard, users

# Kreiranje glavnog API routera
api_router = APIRouter()

# Uključivanje routera za različite endpointe
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["Analysis"])
api_router.include_router(configurations.router, prefix="/configurations", tags=["Configurations"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
