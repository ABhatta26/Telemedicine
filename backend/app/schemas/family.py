from pydantic import BaseModel
from typing import Optional

class FamilyCreate(BaseModel):
    name: str
    relation: str
    age: int
    gender: str

class FamilyResponse(FamilyCreate):
    id: int
    photo_url: Optional[str] = None
    class Config:
        orm_mode = True
