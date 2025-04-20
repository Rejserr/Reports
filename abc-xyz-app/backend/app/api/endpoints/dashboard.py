from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_active_user
from app.database import get_db, execute_query
from app.models.user import User
from app.services.data_service import get_warehouse_zones
import pandas as pd

router = APIRouter()

@router.get("/summary")
async def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća sažetak podataka za dashboard.
    """
    # Dohvaćanje broja artikala
    item_count_query = """
    SELECT COUNT(DISTINCT ItemCode) AS ItemCount
    FROM dbo.Picking
    """
    item_count_df = execute_query(item_count_query)
    item_count = item_count_df['ItemCount'].iloc[0] if not item_count_df.empty else 0
    
    # Dohvaćanje broja picking operacija u zadnjih 30 dana
    picking_count_query = """
    SELECT COUNT(*) AS PickingCount
    FROM dbo.Picking
    WHERE PickDateTime >= DATEADD(day, -30, GETDATE())
    """
    picking_count_df = execute_query(picking_count_query)
    picking_count = picking_count_df['PickingCount'].iloc[0] if not picking_count_df.empty else 0
    
    # Dohvaćanje broja zona skladišta
    warehouse_zones = get_warehouse_zones()
    zone_count = len(warehouse_zones)
    
    # Dohvaćanje broja analiza
    analysis_count_query = """
    SELECT COUNT(*) AS AnalysisCount
    FROM dbo.AnalysisResults
    """
    analysis_count_df = execute_query(analysis_count_query)
    analysis_count = analysis_count_df['AnalysisCount'].iloc[0] if not analysis_count_df.empty else 0
    
    return {
        "item_count": item_count,
        "picking_count": picking_count,
        "zone_count": zone_count,
        "analysis_count": analysis_count
    }

@router.get("/picking-trend")
async def get_picking_trend(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća trend picking operacija za zadani broj dana.
    """
    query = f"""
    SELECT 
        CAST(PickDateTime AS DATE) AS PickDate,
        COUNT(*) AS PickCount
    FROM 
        dbo.Picking
    WHERE 
        PickDateTime >= DATEADD(day, -{days}, GETDATE())
    GROUP BY 
        CAST(PickDateTime AS DATE)
    ORDER BY 
        PickDate
    """
    
    df = execute_query(query)
    
    # Pretvaranje u format za frontend
    if not df.empty:
        df['PickDate'] = df['PickDate'].dt.strftime('%Y-%m-%d')
        result = df.to_dict(orient='records')
    else:
        result = []
    
    return result

@router.get("/top-items")
async def get_top_items(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća top artikle po broju picking operacija.
    """
    query = f"""
    SELECT TOP {limit}
        ItemCode,
        ItemName,
        COUNT(*) AS PickCount,
        SUM(Qty) AS TotalQty
    FROM 
        dbo.Picking
    WHERE 
        PickDateTime >= DATEADD(month, -3, GETDATE())
    GROUP BY 
        ItemCode, ItemName
    ORDER BY 
        PickCount DESC
    """
    
    df = execute_query(query)
    
    # Pretvaranje u format za frontend
    result = df.to_dict(orient='records') if not df.empty else []
    
    return result

@router.get("/warehouse-distribution")
async def get_warehouse_distribution(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća distribuciju picking operacija po zonama skladišta.
    """
    query = """
    SELECT 
        Storage_system AS WarehouseZone,
        COUNT(*) AS PickCount
    FROM 
        dbo.v_pickingStorageSystem
    WHERE 
        Storage_system IS NOT NULL
        AND PickDateTime >= DATEADD(month, -3, GETDATE())
    GROUP BY 
        Storage_system
    ORDER BY 
        PickCount DESC
    """
    
    df = execute_query(query)
    
    # Pretvaranje u format za frontend
    result = df.to_dict(orient='records') if not df.empty else []
    
    return result

@router.get("/abc-xyz-distribution")
async def get_abc_xyz_distribution(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća distribuciju ABC-XYZ klasa za određenu analizu.
    """
    query = f"""
    SELECT 
        ABC_Class, 
        XYZ_Class, 
        COUNT(*) AS ItemCount,
        SUM(TotalTurnover) AS TotalTurnover,
        SUM(TotalQuantity) AS TotalQuantity
    FROM 
        dbo.AnalysisResultDetails
    WHERE 
        ResultID = {result_id}
    GROUP BY 
        ABC_Class, XYZ_Class
    ORDER BY 
        ABC_Class, XYZ_Class
    """
    
    df = execute_query(query)
    
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No data found for analysis with ID {result_id}"
        )
    
    # Kreiranje matrice ABC-XYZ
    matrix = {}
    for abc in ['A', 'B', 'C']:
        matrix[abc] = {}
        for xyz in ['X', 'Y', 'Z']:
            matrix[abc][xyz] = {
                'item_count': 0,
                'turnover': 0,
                'quantity': 0
            }
    
    # Popunjavanje matrice
    for _, row in df.iterrows():
        abc = row['ABC_Class']
        xyz = row['XYZ_Class']
        matrix[abc][xyz] = {
            'item_count': int(row['ItemCount']),
            'turnover': float(row['TotalTurnover']),
            'quantity': float(row['TotalQuantity'])
        }
    
    return matrix

@router.get("/pareto-chart")
async def get_pareto_chart(
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća podatke za Pareto graf za određenu analizu.
    """
    query = f"""
    SELECT 
        ItemCode,
        ItemName,
        TotalTurnover,
        PercentageOfTurnover,
        CumulativePercentage,
        ABC_Class
    FROM 
        dbo.AnalysisResultDetails
    WHERE 
        ResultID = {result_id}
    ORDER BY 
        Rank
    """
    
    df = execute_query(query)
    
    if df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No data found for analysis with ID {result_id}"
        )
    
    # Pretvaranje u format za frontend
    result = df.to_dict(orient='records')
    
    return result

@router.get("/monthly-trend")
async def get_monthly_trend(
    result_id: int,
    item_codes: List[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Dohvaća mjesečni trend za određene artikle iz analize.
    """
    # Osnovni upit za dohvaćanje detalja analize
    details_query = f"""
    SELECT 
        d.DetailID,
        d.ItemCode,
        d.ItemName
    FROM 
        dbo.AnalysisResultDetails d
    WHERE 
        d.ResultID = {result_id}
    """
    
    # Ako su navedeni određeni artikli, filtriraj po njima
    if item_codes and len(item_codes) > 0:
        item_codes_str = ", ".join([f"'{code}'" for code in item_codes])
        details_query += f" AND d.ItemCode IN ({item_codes_str})"
    else:
        # Ako nisu navedeni artikli, dohvati top 10 po prometu
        details_query += " ORDER BY d.TotalTurnover DESC LIMIT 10"
    
    details_df = execute_query(details_query)
    
    if details_df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No items found for analysis with ID {result_id}"
        )
    
    # Dohvaćanje mjesečnih podataka za odabrane artikle
    detail_ids = details_df['DetailID'].tolist()
    detail_ids_str = ", ".join([str(id) for id in detail_ids])
    
    monthly_query = f"""
    SELECT 
        m.DetailID,
        m.YearMonth,
        m.Turnover,
        m.Quantity,
        d.ItemCode,
        d.ItemName
    FROM 
        dbo.AnalysisResultMonthly m
    JOIN 
        dbo.AnalysisResultDetails d ON m.DetailID = d.DetailID
    WHERE 
        m.DetailID IN ({detail_ids_str})
    ORDER BY 
        m.YearMonth, d.TotalTurnover DESC
    """
    
    monthly_df = execute_query(monthly_query)
    
    if monthly_df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No monthly data found for the selected items"
        )
    
    # Organiziranje podataka po artiklima
    result = {}
    for item_code in monthly_df['ItemCode'].unique():
        item_data = monthly_df[monthly_df['ItemCode'] == item_code]
        item_name = item_data['ItemName'].iloc[0]
        
        result[item_code] = {
            'item_name': item_name,
            'months': [],
            'turnover': [],
            'quantity': []
        }
        
        for _, row in item_data.iterrows():
            result[item_code]['months'].append(row['YearMonth'])
            result[item_code]['turnover'].append(float(row['Turnover']))
            result[item_code]['quantity'].append(float(row['Quantity']))
    
    return result

