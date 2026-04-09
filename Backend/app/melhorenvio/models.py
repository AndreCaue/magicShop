from datetime import datetime, timezone
from pydantic import BaseModel, Field


class MelhorEnvioTokenModel(BaseModel):
    access_token: str
    refresh_token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.now(timezone.utc))
