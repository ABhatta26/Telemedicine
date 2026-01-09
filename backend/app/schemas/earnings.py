##app/schemas/earnings.py

from pydantic import BaseModel
from datetime import datetime

class PaymentResponse(BaseModel):
    id: int
    patient_name: str
    amount: int
    method: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class EarningsSummaryResponse(BaseModel):
    total_amount: int
    completed_count: int
    pending_count: int
