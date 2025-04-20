from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Sheme za mjesečne podatke
class MonthlyDataBase(BaseModel):
    year_month: str
    turnover: float
    quantity: float

class MonthlyDataCreate(MonthlyDataBase):
    pass

class MonthlyData(MonthlyDataBase):
    monthly_id: int
    detail_id: int
    
    class Config:
        orm_mode = True

# Sheme za detalje analize
class ResultDetailBase(BaseModel):
    item_code: str
    item_name: Optional[str] = None
    warehouse_zone: Optional[str] = None
    abc_class: str
    xyz_class: str
    total_turnover: float
    total_quantity: float
    percentage_of_turnover: float
    cumulative_percentage: float
    coefficient_variation: float
    avg_monthly_qty: Optional[float] = None
    min_qty_monthly: Optional[float] = None
    max_qty_monthly: Optional[float] = None
    rank: int

class ResultDetailCreate(ResultDetailBase):
    monthly_data: List[MonthlyDataCreate] = []

class ResultDetail(ResultDetailBase):
    detail_id: int
    result_id: int
    monthly_data: List[MonthlyData] = []
    
    class Config:
        orm_mode = True

# Sheme za rezultate analize
class AnalysisResultBase(BaseModel):
    analysis_name: str
    config_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    total_items: Optional[int] = None
    a_items: Optional[int] = None
    b_items: Optional[int] = None
    c_items: Optional[int] = None
    x_items: Optional[int] = None
    y_items: Optional[int] = None
    z_items: Optional[int] = None

class AnalysisResultCreate(AnalysisResultBase):
    details: List[ResultDetailCreate] = []

class AnalysisResult(AnalysisResultBase):
    result_id: int
    analysis_date: datetime
    created_by: Optional[str] = None
    details: List[ResultDetail] = []
    
    class Config:
        orm_mode = True

# Shema za zahtjev za pokretanje analize
class AnalysisRequest(BaseModel):
    analysis_name: str
    config_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    warehouse_zones: Optional[List[str]] = None
    item_codes: Optional[List[str]] = None

# Shema za sažetak analize
class AnalysisSummary(BaseModel):
    result_id: int
    analysis_name: str
    analysis_date: datetime
    total_items: int
    abc_distribution: dict
    xyz_distribution: dict
    
    class Config:
        orm_mode = True
