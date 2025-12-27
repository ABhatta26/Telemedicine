from pydantic import BaseModel
from datetime import date
from typing import Optional

class FamilyCreate(BaseModel):
    name: str
    relation: str
    date_of_birth: date
    emergency_phone: Optional[str] = None

class FamilyResponse(FamilyCreate):
    id: int

    class Config:
        orm_mode = True