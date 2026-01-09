from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from app.database.session import Base

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    time_slot = Column(String) # e.g., "10:00 AM"
    type = Column(String)      # e.g., "Follow-up", "New Consultation"
    status = Column(String)    # completed, in-progress, upcoming
    date = Column(String)      # Storing as string YYYY-MM-DD for simplicity

class Request(Base):
    __tablename__ = "requests"
    id = Column(Integer, primary_key=True, index=True)
    patient_name = Column(String)
    issue = Column(String)     # e.g., "Skin Allergy"
    time = Column(String)      # e.g., "12:15 PM"
    status = Column(String)    # pending, approved, rejected

class DoctorSettings(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True, index=True)
    is_online = Column(Boolean, default=True)
    next_free_slot = Column(String, default="14:00 PM")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, index=True) # To link chat to specific patient
    sender = Column(String) # "doctor" or "patient"
    text = Column(String)   # The actual message content
    timestamp = Column(DateTime, default=datetime.utcnow)

