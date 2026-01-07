from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = (
    os.getenv("DATABASE_URL") or 
    os.getenv("DATABASE_URL_DEV") or 
    "sqlite:///./app.db"
)

if not DATABASE_URL or DATABASE_URL == "":
    raise ValueError("DATABASE_URL não configurada! Configure DATABASE_URL ou DATABASE_URL")

print(f"🔍 Conectando ao banco: {DATABASE_URL[:20]}...")  # Log para debug

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()