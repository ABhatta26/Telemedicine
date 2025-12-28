from pydantic import BaseModel

class DoctorResponse(BaseModel):
    id: int
    full_name: str
    specialization: str
    qualification: str
    experience_years: int
    hospital_name: str
    consultation_fee: float
    rating: float

    class Config:
        from_attributes = True
