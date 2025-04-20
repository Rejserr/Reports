import subprocess
import os
import pandas as pd
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.analysis import AnalysisResult, AnalysisResultDetail, AnalysisResultMonthly
from app.models.configuration import AnalysisConfiguration
from app.schemas.analysis import AnalysisRequest
from app.database import execute_query
import json
import tempfile
def run_abc_xyz_script(
    db: Session,
    analysis_name: str,
    start_date: datetime,
    end_date: datetime,
    warehouse_zones: list = None,
    item_codes: list = None,
    created_by: str = "system"
) -> dict:
    """
    Pokreće ABC_XYZ.py skriptu s navedenim parametrima i sprema rezultate u bazu.
    """
    # Kreiranje privremenog direktorija za rezultate
    temp_dir = tempfile.mkdtemp()
    
    # Priprema parametara za skriptu
    script_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))), "ABC_XYZ.py")
    
    # Formatiranje datuma za skriptu
    start_date_str = start_date.strftime("%Y-%m-%d")
    end_date_str = end_date.strftime("%Y-%m-%d")
    
    # Priprema parametara za filtriranje
    params = [
        "python", 
        script_path,
        "--output-dir", temp_dir,
        "--start-date", start_date_str,
        "--end-date", end_date_str
    ]
    
    # Dodavanje opcionalnih parametara
    if warehouse_zones:
        params.extend(["--warehouse-zones", ",".join(warehouse_zones)])
    
    if item_codes:
        params.extend(["--item-codes", ",".join(item_codes)])
    
    # Pokretanje skripte
    try:
        result = subprocess.run(
            params,
            capture_output=True,
            text=True,
            check=True
        )
        
        # Provjera je li skripta uspješno izvršena
        if result.returncode != 0:
            raise Exception(f"Script execution failed: {result.stderr}")
        
        # Učitavanje rezultata iz Excel datoteke
        excel_path = os.path.join(temp_dir, "abc_xyz_monthly_breakdown.xlsx")
        df = pd.read_excel(excel_path, sheet_name="Monthly Breakdown")
        
        # Kreiranje zapisa o analizi u bazi
        analysis_result = AnalysisResult(
            AnalysisName=analysis_name,
            StartDate=start_date,
            EndDate=end_date,
            AnalysisDate=datetime.now(),
            CreatedBy=created_by,
            ConfigID=1  # Pretpostavljamo da koristimo zadanu konfiguraciju
        )
        
        db.add(analysis_result)
        db.flush()  # Dobivanje ID-a analize
        
        # Spremanje detalja analize u bazu
        for index, row in df.iterrows():
            item_code = row['Item']
            
            # Kreiranje zapisa o detaljima analize
            detail = AnalysisResultDetail(
                ResultID=analysis_result.ResultID,
                ItemCode=item_code,
                ItemName=row['Name'],
                ABC_Class=row['ABC'],
                XYZ_Class=row['XYZ'],
                WarehouseZone=row['Warehouse zone'],
                TotalTurnover=row['Total Turnover'],
                TotalQuantity=row['Total Qty'],
                CoefficientVariation=row.get('Coefficient Variation', 0),
                Rank=index + 1
            )
            
            db.add(detail)
            db.flush()  # Dobivanje ID-a detalja
            
            # Spremanje mjesečnih podataka
            for col in df.columns:
                if col.startswith('Turnover_') or col.startswith('QTY_'):
                    month_str = col.split('_', 1)[1]
                    is_turnover = col.startswith('Turnover_')
                    
                    # Preskakanje ako je vrijednost NaN
                    if pd.isna(row[col]):
                        continue
                    
                    # Ako već postoji zapis za ovaj mjesec, ažuriraj ga
                    existing = db.query(AnalysisResultMonthly).filter(
                        AnalysisResultMonthly.DetailID == detail.DetailID,
                        AnalysisResultMonthly.YearMonth == month_str
                    ).first()
                    
                    if existing:
                        if is_turnover:
                            existing.Turnover = row[col]
                        else:
                            existing.Quantity = row[col]
                    else:
                        # Kreiranje novog zapisa
                        monthly = AnalysisResultMonthly(
                            DetailID=detail.DetailID,
                            YearMonth=month_str,
                            Turnover=row[col] if is_turnover else 0,
                            Quantity=0 if is_turnover else row[col]
                        )
                        db.add(monthly)
        
        # Commit promjena u bazi
        db.commit()
        
        # Učitavanje dodatnih podataka za frontend
        # Distribucije ABC i XYZ
        abc_distribution = df.groupby('ABC').size().reset_index(name='count')
        abc_distribution['percentage'] = abc_distribution['count'] / len(df) * 100
        
        xyz_distribution = df.groupby('XYZ').size().reset_index(name='count')
        xyz_distribution['percentage'] = xyz_distribution['count'] / len(df) * 100
        
        # ABC-XYZ matrica
        matrix_counts = df.groupby(['ABC', 'XYZ']).size().unstack(fill_value=0)
        matrix_percentages = matrix_counts / len(df) * 100
        
        # Pareto podaci
        df_sorted = df.sort_values('Total Turnover', ascending=False)
        df_sorted['percentage'] = df_sorted['Total Turnover'] / df_sorted['Total Turnover'].sum() * 100
        df_sorted['cumulative'] = df_sorted['percentage'].cumsum()
        
        # Top artikli
        top_items = []
        for _, row in df_sorted.head(10).iterrows():
            item_data = {
                'code': row['Item'],
                'name': row['Name'],
                'abc': row['ABC'],
                'xyz': row['XYZ'],
                'turnover': row['Total Turnover'],
                'months': []
            }
            
            # Dodavanje mjesečnih podataka
            for col in df.columns:
                if col.startswith('Turnover_'):
                    month_str = col.split('_', 1)[1]
                    if not pd.isna(row[col]):
                        item_data['months'].append({
                            'month': month_str,
                            'value': float(row[col])
                        })
            
            top_items.append(item_data)
        
        # Kreiranje rezultata za frontend
        frontend_data = {
            'result_id': analysis_result.ResultID,
            'analysis_name': analysis_name,
            'start_date': start_date_str,
            'end_date': end_date_str,
            'distributions': {
                'abc': abc_distribution.to_dict('records'),
                'xyz': xyz_distribution.to_dict('records')
            },
            'matrix': {
                'categories': [[row, col] for row in matrix_counts.index for col in matrix_counts.columns],
                'counts': matrix_counts.values.tolist(),
                'percentages': matrix_percentages.values.tolist()
            },
            'paretoData': {
                'items': df_sorted['Item'].tolist(),
                'values': df_sorted['Total Turnover'].tolist(),
                'cumulative': df_sorted['cumulative'].tolist()
            },
            'topItems': top_items,
            'tableData': df.to_dict('records')
        }
        
        return frontend_data
        
    except Exception as e:
        db.rollback()
        raise Exception(f"Error running ABC_XYZ analysis: {str(e)}")
    finally:
        # Čišćenje privremenih datoteka
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)

def get_safety_stock_factor(xyz_class: str, config: AnalysisConfiguration) -> float:
    """
    Vraća faktor sigurnosne zalihe na temelju XYZ klase.
    """
    if xyz_class == 'X':
        return config.SafetyStock_X_Factor
    elif xyz_class == 'Y':
        return config.SafetyStock_Y_Factor
    else:  # Z
        return config.SafetyStock_Z_Factor

def get_max_qty_factor(abc_class: str, config: AnalysisConfiguration) -> float:
    """
    Vraća faktor maksimalne količine na temelju ABC klase.
    """
    if abc_class == 'A':
        return config.MaxQty_A_Factor
    elif abc_class == 'B':
        return config.MaxQty_B_Factor
    else:  # C
        return config.MaxQty_C_Factor

def get_analysis_summary(db: Session, result_id: int) -> Dict[str, Any]:
    """
    Dohvaća sažetak analize.
    
    Args:
        db: SQLAlchemy sesija
        result_id: ID rezultata analize
        
    Returns:
        Rječnik sa sažetkom analize
    """
    # Dohvaćanje rezultata analize
    analysis = db.query(AnalysisResult).filter(AnalysisResult.ResultID == result_id).first()
    if not analysis:
        raise ValueError(f"Analysis with ID {result_id} not found")
    
    # Dohvaćanje distribucije ABC i XYZ klasa
    abc_distribution = {
        'A': analysis.A_Items,
        'B': analysis.B_Items,
        'C': analysis.C_Items
    }
    
    xyz_distribution = {
        'X': analysis.X_Items,
        'Y': analysis.Y_Items,
        'Z': analysis.Z_Items
    }
    
    # Kreiranje sažetka
    summary = {
        'result_id': analysis.ResultID,
        'analysis_name': analysis.AnalysisName,
        'analysis_date': analysis.AnalysisDate,
        'total_items': analysis.TotalItems,
        'abc_distribution': abc_distribution,
        'xyz_distribution': xyz_distribution
    }
    
    return summary

