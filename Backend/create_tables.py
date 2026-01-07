from app.database import engine, Base
from app.models import *  # importe todos os modelos aqui (ou ajuste o caminho)

if __name__ == "__main__":
    print("Criando todas as tabelas...")
    Base.metadata.drop_all(bind=engine)  # opcional: limpa tudo primeiro
    Base.metadata.create_all(bind=engine)
    print("Tabelas criadas com sucesso!")