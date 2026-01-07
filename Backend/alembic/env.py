from logging.config import fileConfig

from sqlalchemy import create_engine, pool
from sqlalchemy.orm import declarative_base

from alembic import context

from app.database import Base


from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("DATABASE_URL_DEV")
    or "sqlite:///./app.db"
)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL não configurada!")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=pool.NullPool,
    )
else:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        poolclass=pool.NullPool,
    )

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def run_migrations_offline():
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()