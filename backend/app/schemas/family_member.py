from pydantic import BaseModel

class FamilyMemberCreate(BaseModel):
    patient_id: int
    name: str
    relation: str
    age: int


class FamilyMemberResponse(FamilyMemberCreate):
    id: int

    class Config:
        from_attributes = True
