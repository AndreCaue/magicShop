from app.database import SessionLocal
from app.models import User
from passlib.context import CryptContext
from sqlalchemy.orm import Session
#python -m app.core.scripts.create_master_user
# Configuração do hash de senha (usando bcrypt, presente no requirements.txt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_master_user(db: Session):
    # Verifica se já existe um usuário master com scope "master"
    master = db.query(User).filter(User.role == "master", User.scopes.contains(["master"])).first()
    if master:
        print("Usuário master com scope 'master' já existe.")
        return

    # Cria o usuário master
    master_user = User(
        email="master@teste.com",
        password=pwd_context.hash("654321"),
        role="master",
        is_verified=True,
        scopes=["master"]  # Scope para master com permissões completas
    )
    db.add(master_user)
    db.commit()
    print("Usuário master criado com sucesso!")

def main():
    # Cria uma sessão do banco de dados
    db = SessionLocal()
    try:
        create_master_user(db)
    finally:
        db.close()

if __name__ == "__main__":
    main()