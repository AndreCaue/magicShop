from pydantic import BaseModel, EmailStr, ConfigDict

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    model_config = ConfigDict(extra='forbid')