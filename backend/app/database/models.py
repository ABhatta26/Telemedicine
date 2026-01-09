from sqlalchemy import Column, Integer, String, DateTime, Date, Time, Text, ForeignKey
from sqlalchemy.sql import func
from .session import Base
from datetime import datetime
from fastapi import UploadFile, File

import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, Boolean, ForeignKey, case, func
from sqlalchemy.orm import sessionmaker, Session, declarative_base, relationship
from sqlalchemy.sql import exists
from pydantic import BaseModel
from typing import List

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20))
    role = Column(String(32), default="user", nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    specialization = Column(String(50), nullable=False)
    experience = Column(Integer, nullable=False)
    consultation_fee = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ConfigMaster(Base):
    __tablename__ = "config_master"
    id = Column(Integer, primary_key=True, index=True)
    config_type = Column(String(50), index=True)
    code = Column(String(50))
    value = Column(String(100))


class FamilyMember(Base):
    __tablename__ = "family_members"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)

    name = Column(String(100), nullable=False)
    relation = Column(String(50), nullable=False)
    age = Column(Integer)
    gender = Column(String(10), nullable=False)
    photo_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class HealthReport(Base):
    __tablename__ = "health_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    report_type = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    __tablename__ = "appoint_ments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False, index=True)
    appointment_date = Column(Date, nullable=False, index=True)
    appointment_time = Column(String(10), nullable=False)  # Store as "HH:MM" format
    status = Column(String(20), default="scheduled", nullable=False, index=True)  # scheduled, completed, cancelled, rescheduled
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Patient(Base):
    __tablename__ = "patients"  # Changed from _tablename_
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String)
    medical_history = Column(String)

    bookings = relationship("Booking", back_populates="patient")
    payments = relationship("Payment", back_populates="patient")


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))  # Foreign key required
    is_active = Column(Boolean, default=False)
    
    patient = relationship("Patient", back_populates="bookings")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))  # Foreign key required
    is_pending = Column(Boolean, default=True)
    
    patient = relationship("Patient", back_populates="payments")
import enum
from sqlalchemy import Enum, Boolean

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    type = Column(String(32), nullable=False)
    message = Column(Text, nullable=False)
    redirect_to = Column(String(255), nullable=True)

    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PaymentStatus(enum.Enum):
    pending = "pending"
    completed = "completed"


class DoctorPayment(Base):
    __tablename__ = "doctor_payments"

    id = Column(Integer, primary_key=True, index=True)

    doctor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    patient_name = Column(String(100), nullable=False)

    amount = Column(Integer, nullable=False)
    method = Column(String(50), default="UPI")

    status = Column(Enum(PaymentStatus), default=PaymentStatus.pending)

    appointment_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
