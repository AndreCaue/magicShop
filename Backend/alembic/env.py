# alembic/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

#python -m alembic revision --autogenerate -m "add shipping presets table" // comando para criar, somente alterar nomenclatura.
# === IMPORTA O Base E TODOS OS MODELS QUE EXISTEM NO SEU PROJETO ===
from app.database import Base
import app.store.models          # Product
import app.store.branch.models   # Brand (agora está correto – ele existe!)
# Se der erro nessa linha, troque por:
# from app.store.branch import models  # ou apenas comente se não existir

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()