from pydantic import BaseModel

class FamilyCreate(BaseModel):
    name: str
    relation: str
    age: int
    gender: str

class FamilyResponse(FamilyCreate):
    id: int

    class Config:
        orm_mode = True
