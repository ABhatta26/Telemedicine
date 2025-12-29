from pydantic import BaseModel

class DoctorResponse(BaseModel):
    id: int
    full_name: str
    specialization: str
    qualification: str
    experience_years: int
    consultation_fee: float
    

    class Config:
        from_attributes = True
