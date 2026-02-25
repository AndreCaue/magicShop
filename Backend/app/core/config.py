from typing import Literal
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    APP_NAME: str = "MagicShop"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: Literal["development", "production"] = "development"

    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    DATABASE_URL_DEV: str | None = None
    DATABASE_URL: str | None = None

    MELHOR_ENVIO_TOKEN: str | None = None
    MELHOR_ENVIO_TOKEN_SANDBOX: str
    MELHOR_ENVIO_ENV: Literal["production", "sandbox"] = "sandbox"

    EFI_CLIENT_ID: str
    EFI_CLIENT_SECRET: str
    EFI_CERTIFICATE_PATH: str
    EFI_SANDBOX: bool = True

    CEP_KEY: str
    PIX_KEY: str
    STORE_NAME: str
    NGROK_URL: str
    WEBHOOK_URL: str

    CREATE_TABLES: bool

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )


settings = Settings()

if settings.ENVIRONMENT == "production":
    if not settings.DATABASE_URL:
        raise ValueError("DATABASE_URL precisa estar definida em produção!")
    settings.DATABASE_URL = settings.DATABASE_URL
else:
    settings.DATABASE_URL = settings.DATABASE_URL_DEV or "sqlite:///./app.db"

SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
