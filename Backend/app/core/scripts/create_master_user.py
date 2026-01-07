import os
from dotenv import load_dotenv

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User
from app.auth import hash_password

load_dotenv()

def create_master_user(db: Session):
    """
    Cria o usuário master inicial de forma idempotente.
    Requer as variáveis de ambiente:
    - MASTER_EMAIL
    - MASTER_PASSWORD
    """
    email = os.getenv("MASTER_EMAIL")
    password = os.getenv("MASTER_PASSWORD")

    print("=== Iniciando criação do usuário master ===")
    print(f"MASTER_EMAIL: {email or 'NÃO DEFINIDO'}")
    print(f"MASTER_PASSWORD: {'DEFINIDA' if password else 'NÃO DEFINIDA'}")

    if not email or not password:
        print("ERRO: MASTER_EMAIL ou MASTER_PASSWORD não estão definidas. Pulando criação.")
        return

    existing_user = db.query(User).filter(User.email == email.lower()).first()
    if existing_user:
        print(f"Usuário master com email {email} já existe (ID: {existing_user.id}). Pulando criação.")
        return

    try:
        master_user = User(
            email=email.lower(),
            hashed_password=hash_password(password),  
            role="master",              
            is_verified=True,           
            scopes=["master"],          
        )
        db.add(master_user)
        db.commit()
        db.refresh(master_user)
        print(f"Usuário master criado com sucesso! ID: {master_user.id} | Email: {master_user.email}")
    except Exception as e:
        db.rollback()
        print(f"ERRO ao criar usuário master: {str(e)}")

def main():
    db: Session = SessionLocal()
    try:
        create_master_user(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()