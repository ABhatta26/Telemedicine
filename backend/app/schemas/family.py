from pydantic import BaseModel
from datetime import date
from typing import Optional

class FamilyCreate(BaseModel):
    name: str
    relation: str
    age: int | None = None
    gender: str

class FamilyResponse(FamilyCreate):
    id: int
    photo_url: Optional[str] = None

    class Config:
        from_attributes = True
