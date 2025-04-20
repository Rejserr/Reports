import pyodbc
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import pandas as pd

# Kreiranje connection stringa za SQL Server
if settings.DB_TRUSTED_CONNECTION:
    connection_string = f"Driver={{{settings.DB_DRIVER}}};Server={settings.DB_SERVER};Database={settings.DB_NAME};Trusted_Connection=yes;"
else:
    connection_string = f"Driver={{{settings.DB_DRIVER}}};Server={settings.DB_SERVER};Database={settings.DB_NAME};UID={settings.DB_USER};PWD={settings.DB_PASSWORD};"

# Kreiranje SQLAlchemy engine-a
engine = create_engine(f"mssql+pyodbc:///?odbc_connect={connection_string}")

# Kreiranje sesije
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bazna klasa za SQLAlchemy modele
Base = declarative_base()

# Funkcija za dobivanje DB sesije
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Funkcija za direktno izvršavanje SQL upita i dobivanje rezultata kao DataFrame
def execute_query(query, params=None):
    try:
        conn = pyodbc.connect(connection_string)
        df = pd.read_sql(query, conn, params=params)
        conn.close()
        return df
    except Exception as e:
        print(f"Error executing query: {e}")
        raise
