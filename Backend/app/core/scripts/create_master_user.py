from app.database import SessionLocal
from app.models import User
from app.core.auth import hash_password  # Reutiliza sua função
from sqlalchemy.orm import Session
import os
from dotenv import load_dotenv

load_dotenv()

def create_master_user(db: Session):
    """
    Cria usuário master inicial.
    Configurar MASTER_EMAIL e MASTER_PASSWORD no .env
    
    Uso: python -m app.scripts.create_master_user
    """
    email = os.getenv("MASTER_EMAIL")
    password = os.getenv("MASTER_PASSWORD")
    
    if not email or not password:
        return
    
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return

    master_user = User(
        email=email,
        password=hash_password(password),
        role="master",
        is_verified=True,
        scopes=["master"]
    )
    db.add(master_user)
    db.commit()

def main():
    db = SessionLocal()
    try:
        create_master_user(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()