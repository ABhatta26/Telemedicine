from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class AppointmentCreate(BaseModel):
    doctor_id: int
    appointment_date: date
    appointment_time: str  # Format: "HH:MM"
    reason: Optional[str] = None

class AppointmentUpdate(BaseModel):
    status: str  # scheduled, completed, cancelled, rescheduled
    appointment_date: Optional[date] = None
    appointment_time: Optional[str] = None

class AppointmentResponse(BaseModel):
    id: int
    patient_id: int
    doctor_id: int
    appointment_date: date
    appointment_time: str
    status: str
    reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Additional fields for display
    patient_name: Optional[str] = None
    doctor_name: Optional[str] = None

    class Config:
        from_attributes = True

class AppointmentStats(BaseModel):
    today: int
    upcoming: int
    completed: int
    cancelled: int
    rescheduled: int
    total_today: int
