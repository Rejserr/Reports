from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_active_user, get_current_admin_user
from app.database import get_db
from app.models.configuration import AnalysisConfiguration
from app.models.user import User
from app.schemas.configuration import Configuration, ConfigurationCreate, ConfigurationUpdate
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[Configuration])
async def read_configurations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća listu svih konfiguracija.
    """
    configurations = db.query(AnalysisConfiguration).offset(skip).limit(limit).all()
    return configurations

@router.get("/default", response_model=Configuration)
async def read_default_configuration(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća zadanu konfiguraciju.
    """
    configuration = db.query(AnalysisConfiguration).filter(AnalysisConfiguration.IsDefault == True).first()
    if not configuration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Default configuration not found"
        )
    return configuration

@router.get("/{config_id}", response_model=Configuration)
async def read_configuration(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća konfiguraciju prema ID-u.
    """
    configuration = db.query(AnalysisConfiguration).filter(AnalysisConfiguration.ConfigID == config_id).first()
    if not configuration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    return configuration

@router.post("/", response_model=Configuration, status_code=status.HTTP_201_CREATED)
async def create_configuration(
    config_in: ConfigurationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Kreira novu konfiguraciju. Samo za administratore.
    """
    # Ako je nova konfiguracija označena kao zadana, poništi zadanu oznaku na svim ostalim konfiguracijama
    if config_in.is_default:
        db.query(AnalysisConfiguration).filter(AnalysisConfiguration.IsDefault == True).update({"IsDefault": False})
    
    # Kreiranje nove konfiguracije
    db_config = AnalysisConfiguration(
        ConfigName=config_in.config_name,
        Description=config_in.description,
        ABC_A_Threshold=config_in.abc_a_threshold,
        ABC_B_Threshold=config_in.abc_b_threshold,
        XYZ_X_Threshold=config_in.xyz_x_threshold,
        XYZ_Y_Threshold=config_in.xyz_y_threshold,
        LeadTimeWeeks=config_in.lead_time_weeks,
        SafetyStock_X_Factor=config_in.safety_stock_x_factor,
        SafetyStock_Y_Factor=config_in.safety_stock_y_factor,
        SafetyStock_Z_Factor=config_in.safety_stock_z_factor,
        MaxQty_A_Factor=config_in.max_qty_a_factor,
        MaxQty_B_Factor=config_in.max_qty_b_factor,
        MaxQty_C_Factor=config_in.max_qty_c_factor,
        IsDefault=config_in.is_default,
                CreatedBy=current_user.Username,
        CreatedDate=datetime.utcnow()
    )
    
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    return db_config

@router.put("/{config_id}", response_model=Configuration)
async def update_configuration(
    config_id: int,
    config_in: ConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Ažurira postojeću konfiguraciju. Samo za administratore.
    """
    # Dohvaćanje konfiguracije iz baze
    db_config = db.query(AnalysisConfiguration).filter(AnalysisConfiguration.ConfigID == config_id).first()
    if not db_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    # Ako je nova konfiguracija označena kao zadana, poništi zadanu oznaku na svim ostalim konfiguracijama
    if config_in.is_default is not None and config_in.is_default and not db_config.IsDefault:
        db.query(AnalysisConfiguration).filter(AnalysisConfiguration.IsDefault == True).update({"IsDefault": False})
    
    # Ažuriranje podataka konfiguracije
    update_data = config_in.dict(exclude_unset=True)
    
    # Mapiranje imena polja iz Pydantic modela u imena stupaca u bazi
    field_mapping = {
        "config_name": "ConfigName",
        "description": "Description",
        "abc_a_threshold": "ABC_A_Threshold",
        "abc_b_threshold": "ABC_B_Threshold",
        "xyz_x_threshold": "XYZ_X_Threshold",
        "xyz_y_threshold": "XYZ_Y_Threshold",
        "lead_time_weeks": "LeadTimeWeeks",
        "safety_stock_x_factor": "SafetyStock_X_Factor",
        "safety_stock_y_factor": "SafetyStock_Y_Factor",
        "safety_stock_z_factor": "SafetyStock_Z_Factor",
        "max_qty_a_factor": "MaxQty_A_Factor",
        "max_qty_b_factor": "MaxQty_B_Factor",
        "max_qty_c_factor": "MaxQty_C_Factor",
        "is_default": "IsDefault"
    }
    
    # Ažuriranje polja
    for field, value in update_data.items():
        if field in field_mapping:
            setattr(db_config, field_mapping[field], value)
    
    # Postavljanje podataka o ažuriranju
    db_config.ModifiedBy = current_user.Username
    db_config.ModifiedDate = datetime.utcnow()
    
    db.commit()
    db.refresh(db_config)
    
    return db_config

@router.delete("/{config_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_configuration(
    config_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Briše konfiguraciju. Samo za administratore.
    """
    # Dohvaćanje konfiguracije iz baze
    db_config = db.query(AnalysisConfiguration).filter(AnalysisConfiguration.ConfigID == config_id).first()
    if not db_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Configuration not found"
        )
    
    # Provjera je li konfiguracija zadana
    if db_config.IsDefault:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete default configuration"
        )
    
    # Brisanje konfiguracije
    db.delete(db_config)
    db.commit()
    
    return None

