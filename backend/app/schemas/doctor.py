from pydantic import BaseModel

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    experience: int
    consultation_fee: int

    class Config:
        from_attributes = True
