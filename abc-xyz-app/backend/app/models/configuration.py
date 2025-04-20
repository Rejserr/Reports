from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, func
from app.database import Base

class AnalysisConfiguration(Base):
    __tablename__ = "AnalysisConfigurations"
    
    ConfigID = Column(Integer, primary_key=True, index=True)
    ConfigName = Column(String(100), nullable=False)
    Description = Column(String(500))
    ABC_A_Threshold = Column(Float, default=80.0)
    ABC_B_Threshold = Column(Float, default=95.0)
    XYZ_X_Threshold = Column(Float, default=20.0)
    XYZ_Y_Threshold = Column(Float, default=40.0)
    LeadTimeWeeks = Column(Float, default=2.0)
    SafetyStock_X_Factor = Column(Float, default=1.0)
    SafetyStock_Y_Factor = Column(Float, default=1.5)
    SafetyStock_Z_Factor = Column(Float, default=2.5)
    MaxQty_A_Factor = Column(Float, default=1.5)
    MaxQty_B_Factor = Column(Float, default=2.0)
    MaxQty_C_Factor = Column(Float, default=3.0)
    IsDefault = Column(Boolean, default=False)
    CreatedBy = Column(String(100))
    CreatedDate = Column(DateTime, default=func.now())
    ModifiedBy = Column(String(100))
    ModifiedDate = Column(DateTime)
