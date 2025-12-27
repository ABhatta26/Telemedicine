from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .session import Base
from datetime import datetime


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
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class HealthReport(Base):
    __tablename__ = "health_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    report_type = Column(String, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

