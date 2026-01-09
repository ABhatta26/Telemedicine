#  Telemedicine/backend/app/schemas/doctorD.py

from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AppointmentSchema(BaseModel):
    id: int
    patient_name: str
    time_slot: str
    type: str
    status: str
    date: str  # <--- NEW: Added this field

    class Config:
        # Use 'from_attributes = True' if you are on Pydantic v2
        # Use 'orm_mode = True' if you are on Pydantic v1
        from_attributes = True

        orm_mode = True

class RequestSchema(BaseModel):
    id: int
    patient_name: str
    issue: str
    time: str
    class Config:
        orm_mode = True

class StatusUpdate(BaseModel):
    is_online: bool


# Schema for receiving a message from Frontend
class ChatMessageCreate(BaseModel):
    patientId: int
    text: str
    sender: str

# Schema for sending history to Frontend
class ChatMessageOut(BaseModel):
    id: int
    sender: str
    text: str
    # Update this line to allow None:
    timestamp: Optional[datetime] = None 

    class Config:
        orm_mode = True


class CombinedRecordsSchema(BaseModel):
    appointments: List[AppointmentSchema]
    request_history: List[RequestSchema]