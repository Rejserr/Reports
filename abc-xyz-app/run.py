from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pandas as pd
import pyodbc
import os
from datetime import datetime, timedelta
import json

# Kreiranje Flask aplikacije
app = Flask(__name__)
CORS(app)

# Konfiguracija za JWT
app.config['JWT_SECRET_KEY'] = 'your-secret-key-for-jwt-tokens'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(minutes=60)
jwt = JWTManager(app)

# Konfiguracija za bazu podataka
DB_DRIVER = "ODBC Driver 17 for SQL Server"
DB_SERVER = "ft-AppServer01\\SQLEXPRESS"
DB_NAME = "Reports"
DB_TRUSTED_CONNECTION = True

# Funkcija za povezivanje s bazom
def get_db_connection():
    if DB_TRUSTED_CONNECTION:
        connection_string = f"Driver={{{DB_DRIVER}}};Server={DB_SERVER};Database={DB_NAME};Trusted_Connection=yes;"
    else:
        connection_string = f"Driver={{{DB_DRIVER}}};Server={DB_SERVER};Database={DB_NAME};UID={DB_USER};PWD={DB_PASSWORD};"
    
    return pyodbc.connect(connection_string)

# Funkcija za izvršavanje SQL upita
def execute_query(query, params=None):
    try:
        conn = get_db_connection()
        df = pd.read_sql(query, conn, params=params)
        conn.close()
        return df
    except Exception as e:
        print(f"Error executing query: {e}")
        raise

# Rute za autentikaciju
@app.route('/api/auth/token', methods=['POST'])
def login():
    if not request.is_json:
        return jsonify({"msg": "Missing JSON in request"}), 400
    
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    
    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400
    
    # Ovdje bi trebala biti provjera korisnika u bazi
    # Za demonstraciju, prihvaćamo bilo koje korisničko ime/lozinku
    access_token = create_access_token(identity=username)
    return jsonify(access_token=access_token, token_type="bearer"), 200

# Ruta za provjeru zdravlja
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

# Ruta za dohvat podataka za dashboard
@app.route('/api/dashboard/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    try:
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
        zone_count_query = """
        SELECT COUNT(DISTINCT Storage_system) AS ZoneCount
        FROM dbo.Locations
        WHERE Storage_system IS NOT NULL
        """
        zone_count_df = execute_query(zone_count_query)
        zone_count = zone_count_df['ZoneCount'].iloc[0] if not zone_count_df.empty else 0
        
        # Dohvaćanje broja analiza
        analysis_count_query = """
        SELECT COUNT(*) AS AnalysisCount
        FROM dbo.AnalysisResults
        """
        analysis_count_df = execute_query(analysis_count_query)
        analysis_count = analysis_count_df['AnalysisCount'].iloc[0] if not analysis_count_df.empty else 0
        
        return jsonify({
            "item_count": int(item_count),
            "picking_count": int(picking_count),
            "zone_count": int(zone_count),
            "analysis_count": int(analysis_count)
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta za dohvat trenda picking operacija
@app.route('/api/dashboard/picking-trend', methods=['GET'])
@jwt_required()
def get_picking_trend():
    try:
        days = request.args.get('days', default=30, type=int)
        
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
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta za dohvat top artikala
@app.route('/api/dashboard/top-items', methods=['GET'])
@jwt_required()
def get_top_items():
    try:
        limit = request.args.get('limit', default=10, type=int)
        
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
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta za dohvat distribucije po zonama skladišta
@app.route('/api/dashboard/warehouse-distribution', methods=['GET'])
@jwt_required()
def get_warehouse_distribution():
    try:
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
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta za dohvat zona skladišta
@app.route('/api/warehouse-zones', methods=['GET'])
@jwt_required()
def get_warehouse_zones():
    try:
        query = """
        SELECT DISTINCT Storage_system
        FROM dbo.Locations
        WHERE Storage_system IS NOT NULL
        ORDER BY Storage_system
        """
        
        df = execute_query(query)
        
        if 'Storage_system' in df.columns:
            zones = df['Storage_system'].tolist()
            return jsonify(zones), 200
        return jsonify([]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta za pokretanje ABC-XYZ analize
@app.route('/api/analysis/run', methods=['POST'])
@jwt_required()
def run_analysis():
    try:
        data = request.json
        analysis_name = data.get('analysis_name', 'New Analysis')
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        warehouse_zones = data.get('warehouse_zones')
        item_codes = data.get('item_codes')
        
        # Ovdje bi trebala biti implementacija ABC-XYZ analize
        # Za demonstraciju, vraćamo mock rezultat
        
        result = {
            "result_id": 1,
            "analysis_name": analysis_name,
            "analysis_date": datetime.now().isoformat(),
            "total_items": 100,
            "a_items": 20,
            "b_items": 30,
            "c_items": 50,
            "x_items": 25,
            "y_items": 35,
            "z_items": 40
        }
        
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Ruta za dohvat liste analiza
@app.route('/api/analysis', methods=['GET'])
@jwt_required()
def get_analyses():
    try:
        # Za demonstraciju, vraćamo mock rezultate
        analyses = [
            {
                "result_id": 1,
                "analysis_name": "Analiza 1",
                "analysis_date": "2023-06-01T10:00:00",
                "total_items": 100,
                "abc_distribution": {"A": 20, "B": 30, "C": 50},
                "xyz_distribution": {"X": 25, "Y": 35, "Z": 40}
            },
            {
                "result_id": 2,
                "analysis_name": "Analiza 2",
                "analysis_date": "2023-07-15T14:30:00",
                "total_items": 150,
                "abc_distribution": {"A": 30, "B": 45, "C": 75},
                "xyz_distribution": {"X": 40, "Y": 50, "Z": 60}
            }
        ]
        
        return jsonify(analyses), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Pokretanje aplikacije
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000, debug=True)
