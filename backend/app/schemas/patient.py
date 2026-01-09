from pydantic import BaseModel
from datetime import date
from typing import Optional

class PatientDashboardView(BaseModel):
    id: int
    full_name: str
    age: int
    gender: str
    has_active_booking: bool
    has_pending_payment: bool

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    total_patients: int
    patients_with_active_bookings: int
    patients_with_pending_payments: int
