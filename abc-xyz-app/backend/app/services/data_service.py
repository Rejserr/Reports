import pandas as pd
from sqlalchemy.orm import Session
from app.database import execute_query
from datetime import datetime
from typing import List, Optional, Dict, Any

def get_picking_data(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    warehouse_zones: Optional[List[str]] = None,
    item_codes: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Dohvaća podatke o picking operacijama iz baze podataka.
    
    Args:
        start_date: Početni datum za filtriranje
        end_date: Završni datum za filtriranje
        warehouse_zones: Lista zona skladišta za filtriranje
        item_codes: Lista šifri artikala za filtriranje
        
    Returns:
        DataFrame s podacima o picking operacijama
    """
    # Osnovni upit
    query = """
    SELECT 
        p.ItemCode, 
        p.ItemName, 
        p.PickDateTime AS Date, 
        p.Qty AS PickQty,
        p.Storage_system AS WarehouseZone
    FROM 
        dbo.v_pickingStorageSystem p
    WHERE 
        1=1
    """
    
    # Parametri za upit
    params = {}
    
    # Dodavanje filtera za datume
    if start_date:
        query += " AND p.PickDateTime >= ?"
        params[len(params)] = start_date
    
    if end_date:
        query += " AND p.PickDateTime <= ?"
        params[len(params)] = end_date
    
    # Dodavanje filtera za zone skladišta
    if warehouse_zones and len(warehouse_zones) > 0:
        placeholders = ", ".join(["?" for _ in warehouse_zones])
        query += f" AND p.Storage_system IN ({placeholders})"
        for zone in warehouse_zones:
            params[len(params)] = zone
    
    # Dodavanje filtera za šifre artikala
    if item_codes and len(item_codes) > 0:
        placeholders = ", ".join(["?" for _ in item_codes])
        query += f" AND p.ItemCode IN ({placeholders})"
        for item_code in item_codes:
            params[len(params)] = item_code
    
    # Izvršavanje upita
    df = execute_query(query, params)
    
    # Pretvaranje datuma u datetime format
    if 'Date' in df.columns:
        df['Date'] = pd.to_datetime(df['Date'])
    
    return df

def get_stock_data(
    warehouse_zones: Optional[List[str]] = None,
    item_codes: Optional[List[str]] = None
) -> pd.DataFrame:
    """
    Dohvaća podatke o trenutnim zalihama iz baze podataka.
    
    Args:
        warehouse_zones: Lista zona skladišta za filtriranje
        item_codes: Lista šifri artikala za filtriranje
        
    Returns:
        DataFrame s podacima o zalihama
    """
    # Osnovni upit
    query = """
    SELECT 
        s.Code AS LocationCode,
        s.Storage_system AS WarehouseZone,
        s.Product AS ItemCode,
        s.stk_CUQuantity AS Quantity,
        s.CUUnitDescr AS UnitOfMeasure
    FROM 
        dbo.v_SystemStorage s
    WHERE 
        1=1
    """
    
    # Parametri za upit
    params = {}
    
    # Dodavanje filtera za zone skladišta
    if warehouse_zones and len(warehouse_zones) > 0:
        placeholders = ", ".join(["?" for _ in warehouse_zones])
        query += f" AND s.Storage_system IN ({placeholders})"
        for zone in warehouse_zones:
            params[len(params)] = zone
    
    # Dodavanje filtera za šifre artikala
    if item_codes and len(item_codes) > 0:
        placeholders = ", ".join(["?" for _ in item_codes])
        query += f" AND s.Product IN ({placeholders})"
        for item_code in item_codes:
            params[len(params)] = item_code
    
    # Izvršavanje upita
    df = execute_query(query, params)
    
    return df

def get_warehouse_zones() -> List[str]:
    """
    Dohvaća listu svih zona skladišta.
    
    Returns:
        Lista zona skladišta
    """
    query = """
    SELECT DISTINCT Storage_system
    FROM dbo.Locations
    WHERE Storage_system IS NOT NULL
    ORDER BY Storage_system
    """
    
    df = execute_query(query)
    
    if 'Storage_system' in df.columns:
        return df['Storage_system'].tolist()
    return []

def get_item_list() -> pd.DataFrame:
    """
    Dohvaća listu svih artikala s osnovnim podacima.
    
    Returns:
        DataFrame s podacima o artiklima
    """
    query = """
    SELECT DISTINCT 
        p.ItemCode, 
        p.ItemName
    FROM 
        dbo.Picking p
    WHERE 
        p.ItemCode IS NOT NULL
    ORDER BY 
        p.ItemCode
    """
    
    df = execute_query(query)
    
    return df
