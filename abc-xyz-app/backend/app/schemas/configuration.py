from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

# Bazna shema za konfiguraciju
class ConfigurationBase(BaseModel):
    config_name: str
    description: Optional[str] = None
    abc_a_threshold: float = Field(80.0, ge=0, le=100)
    abc_b_threshold: float = Field(95.0, ge=0, le=100)
    xyz_x_threshold: float = Field(20.0, ge=0, le=100)
    xyz_y_threshold: float = Field(40.0, ge=0, le=100)
    lead_time_weeks: float = Field(2.0, ge=0)
    safety_stock_x_factor: float = Field(1.0, ge=0)
    safety_stock_y_factor: float = Field(1.5, ge=0)
    safety_stock_z_factor: float = Field(2.5, ge=0)
    max_qty_a_factor: float = Field(1.5, ge=0)
    max_qty_b_factor: float = Field(2.0, ge=0)
    max_qty_c_factor: float = Field(3.0, ge=0)
    is_default: bool = False

# Shema za kreiranje konfiguracije
class ConfigurationCreate(ConfigurationBase):
    pass

# Shema za ažuriranje konfiguracije
class ConfigurationUpdate(BaseModel):
    config_name: Optional[str] = None
    description: Optional[str] = None
    abc_a_threshold: Optional[float] = Field(None, ge=0, le=100)
    abc_b_threshold: Optional[float] = Field(None, ge=0, le=100)
    xyz_x_threshold: Optional[float] = Field(None, ge=0, le=100)
    xyz_y_threshold: Optional[float] = Field(None, ge=0, le=100)
    lead_time_weeks: Optional[float] = Field(None, ge=0)
    safety_stock_x_factor: Optional[float] = Field(None, ge=0)
    safety_stock_y_factor: Optional[float] = Field(None, ge=0)
    safety_stock_z_factor: Optional[float] = Field(None, ge=0)
    max_qty_a_factor: Optional[float] = Field(None, ge=0)
    max_qty_b_factor: Optional[float] = Field(None, ge=0)
    max_qty_c_factor: Optional[float] = Field(None, ge=0)
    is_default: Optional[bool] = None

# Shema za prikaz konfiguracije
class Configuration(ConfigurationBase):
    config_id: int
    created_by: Optional[str] = None
    created_date: datetime
    modified_by: Optional[str] = None
    modified_date: Optional[datetime] = None
    
    class Config:
        orm_mode = True
