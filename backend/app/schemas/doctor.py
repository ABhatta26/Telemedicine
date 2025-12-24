from pydantic import BaseModel

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str | None = None
    degree: str | None = None

    class Config:
        from_attributes = True
