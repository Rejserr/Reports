from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import api_router
from app.database import engine, Base

# Kreiranje FastAPI aplikacije
app = FastAPI(
    title=settings.APP_NAME,
    description="API za ABC-XYZ analizu skladišta",
    version="0.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Dodavanje CORS middleware-a
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uključivanje API ruta
app.include_router(api_router, prefix="/api")

# Kreiranje tablica u bazi podataka ako ne postoje
# Base.metadata.create_all(bind=engine)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Welcome to ABC-XYZ Analysis API"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=6000, reload=True)
