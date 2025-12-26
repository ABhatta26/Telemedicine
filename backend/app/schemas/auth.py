from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    phone: str | None = None
    password: str
    role: str = "user"

class LoginRequest(BaseModel):
    username: str
    password: str

class UserPublic(BaseModel):
    id: int
    username: str
    email: EmailStr
    phone: str | None = None
    role: str

    class Config:
        from_attributes = True
