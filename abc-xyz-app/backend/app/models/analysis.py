from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class AnalysisResult(Base):
    __tablename__ = "AnalysisResults"
    
    ResultID = Column(Integer, primary_key=True, index=True)
    ConfigID = Column(Integer, ForeignKey("AnalysisConfigurations.ConfigID"), nullable=False)
    AnalysisName = Column(String(100), nullable=False)
    AnalysisDate = Column(DateTime, default=func.now())
    StartDate = Column(DateTime)
    EndDate = Column(DateTime)
    TotalItems = Column(Integer)
    A_Items = Column(Integer)
    B_Items = Column(Integer)
    C_Items = Column(Integer)
    X_Items = Column(Integer)
    Y_Items = Column(Integer)
    Z_Items = Column(Integer)
    CreatedBy = Column(String(100))
    
    # Relacije
    details = relationship("AnalysisResultDetail", back_populates="result", cascade="all, delete-orphan")
    configuration = relationship("AnalysisConfiguration")

class AnalysisResultDetail(Base):
    __tablename__ = "AnalysisResultDetails"
    
    DetailID = Column(Integer, primary_key=True, index=True)
    ResultID = Column(Integer, ForeignKey("AnalysisResults.ResultID"), nullable=False)
    ItemCode = Column(String(50), nullable=False)
    ItemName = Column(String(500))
    WarehouseZone = Column(String(50))
    ABC_Class = Column(String(1))
    XYZ_Class = Column(String(1))
    TotalTurnover = Column(Float)
    TotalQuantity = Column(Float)
    PercentageOfTurnover = Column(Float)
    CumulativePercentage = Column(Float)
    CoefficientVariation = Column(Float)
    AvgMonthlyQty = Column(Float)
    MinQtyMonthly = Column(Float)
    MaxQtyMonthly = Column(Float)
    Rank = Column(Integer)
    
    # Relacije
    result = relationship("AnalysisResult", back_populates="details")
    monthly_data = relationship("AnalysisResultMonthly", back_populates="detail", cascade="all, delete-orphan")

class AnalysisResultMonthly(Base):
    __tablename__ = "AnalysisResultMonthly"
    
    MonthlyID = Column(Integer, primary_key=True, index=True)
    DetailID = Column(Integer, ForeignKey("AnalysisResultDetails.DetailID"), nullable=False)
    YearMonth = Column(String(7), nullable=False)  # Format: YYYY-MM
    Turnover = Column(Float)
    Quantity = Column(Float)
    
    # Relacije
    detail = relationship("AnalysisResultDetail", back_populates="monthly_data")
