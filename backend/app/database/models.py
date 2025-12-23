#app/database/models.py
# SQLAlchemy models placeholder 
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from .session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(String(32), default="user", nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone_no = Column(String(20))
    specialization = Column(String(100))
    degree = Column(String(100))
    registration_number = Column(String(100), unique=True)
    status = Column(String(20), default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Configuration(Base):
    __tablename__ = "configurations"

    id = Column(Integer, primary_key=True, index=True)
    item_code = Column(String(50), index=True)   # FAMILY_RELATION, SPECIALIZATION
    item_name = Column(String(100))
    status = Column(String(20), default="active")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    relation = Column(String(50))
    age = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
