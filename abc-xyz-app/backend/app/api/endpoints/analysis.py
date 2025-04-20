from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.auth import get_current_active_user
from app.database import get_db
from app.models.analysis import AnalysisResult, AnalysisResultDetail, AnalysisResultMonthly
from app.models.configuration import AnalysisConfiguration
from app.models.user import User
from app.schemas.analysis import AnalysisResult as AnalysisResultSchema
from app.schemas.analysis import AnalysisRequest, AnalysisSummary, ResultDetail
from app.services.analysis_service import run_abc_xyz_analysis, get_analysis_summary, run_abc_xyz_script
from datetime import datetime
router = APIRouter()

@router.post("/run", response_model=AnalysisResultSchema, status_code=status.HTTP_201_CREATED)
async def run_analysis(
    analysis_request: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Pokreće ABC-XYZ analizu s navedenim parametrima.
    """
    # Provjera postoji li konfiguracija
    config_id = analysis_request.config_id
    if config_id is None:
        # Ako nije naveden config_id, koristi zadanu konfiguraciju
        config = db.query(AnalysisConfiguration).filter(AnalysisConfiguration.IsDefault == True).first()
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Default configuration not found"
            )
        config_id = config.ConfigID
    else:
        # Provjera postoji li navedena konfiguracija
        config = db.query(AnalysisConfiguration).filter(AnalysisConfiguration.ConfigID == config_id).first()
        if not config:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Configuration with ID {config_id} not found"
            )
    
    # Pokretanje analize
    try:
        result = run_abc_xyz_analysis(
            db=db,
            config_id=config_id,
            analysis_name=analysis_request.analysis_name,
            start_date=analysis_request.start_date,
            end_date=analysis_request.end_date,
            warehouse_zones=analysis_request.warehouse_zones,
            item_codes=analysis_request.item_codes,
            created_by=current_user.Username
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/run-script", response_model=AnalysisResultSchema, status_code=status.HTTP_201_CREATED)
async def run_abc_xyz_script_endpoint(
    analysis_request: AnalysisRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Pokreće ABC-XYZ.py skriptu s navedenim parametrima.
    """
    try:
        result = run_abc_xyz_script(
            db=db,
            analysis_name=analysis_request.analysis_name,
            start_date=analysis_request.start_date,
            end_date=analysis_request.end_date,
            warehouse_zones=analysis_request.warehouse_zones,
            item_codes=analysis_request.item_codes,
            created_by=current_user.Username
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/", response_model=List[AnalysisSummary])
async def read_analyses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća listu svih analiza.
    """
    analyses = db.query(AnalysisResult).order_by(AnalysisResult.AnalysisDate.desc()).offset(skip).limit(limit).all()
    
    # Pretvaranje rezultata u sažetke
    summaries = []
    for analysis in analyses:
        summary = get_analysis_summary(db, analysis.ResultID)
        summaries.append(summary)
    
    return summaries

@router.get("/{result_id}", response_model=AnalysisResultSchema)
async def read_analysis(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća detalje analize prema ID-u.
    """
    analysis = db.query(AnalysisResult).filter(AnalysisResult.ResultID == result_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    return analysis

@router.get("/{result_id}/details", response_model=List[ResultDetail])
async def read_analysis_details(
    result_id: int,
    abc_class: Optional[str] = Query(None, regex="^[ABC]$"),
    xyz_class: Optional[str] = Query(None, regex="^[XYZ]$"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća detalje analize prema ID-u s mogućnošću filtriranja po ABC i XYZ klasama.
    """
    # Provjera postoji li analiza
    analysis = db.query(AnalysisResult).filter(AnalysisResult.ResultID == result_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Kreiranje upita za detalje
    query = db.query(AnalysisResultDetail).filter(AnalysisResultDetail.ResultID == result_id)
    
    # Dodavanje filtera
    if abc_class:
        query = query.filter(AnalysisResultDetail.ABC_Class == abc_class)
    if xyz_class:
        query = query.filter(AnalysisResultDetail.XYZ_Class == xyz_class)
    
    # Sortiranje po rangu
    query = query.order_by(AnalysisResultDetail.Rank)
    
    # Paginacija
    details = query.offset(skip).limit(limit).all()
    
    return details

@router.delete("/{result_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Briše analizu i sve povezane detalje.
    """
    # Dohvaćanje analize iz baze
    analysis = db.query(AnalysisResult).filter(AnalysisResult.ResultID == result_id).first()
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    # Brisanje analize (kaskadno će se obrisati i svi detalji)
    db.delete(analysis)
    db.commit()
    
    return None
