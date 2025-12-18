from pydantic import BaseModel
from typing import Optional

class SuccessMessage(BaseModel):
    message: str
    detail: Optional[dict] = None