# app/core/config.py
import os
from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # === App geral ===
    APP_NAME: str = "MagicShop"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "production"] = "development"

    # === JWT ===
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24h

    # === Database ===
    DATABASE_URL: str = "sqlite:///./dev.db"

    # === Melhor Envio ===
    MELHOR_ENVIO_TOKEN: str | None = None  # opcional em dev/sandbox
    MELHOR_ENVIO_TOKEN_SANDBOX: str  # ← ESSA LINHA ESTAVA FALTANDO!
    MELHOR_ENVIO_ENV: Literal["production", "sandbox"] = "sandbox"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

# Instância única
settings = Settings(_env_file=None)