from sqlalchemy import Column, Integer, String, Boolean, Float
from app.database.session import Base  

# -------------------- User Table --------------------
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(String, default="user")
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


# -------------------- Doctor Table --------------------
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True, nullable=False)
    specialization = Column(String, index=True, nullable=False)
    qualification = Column(String)
    experience_years = Column(Integer)
    hospital_name = Column(String)
    consultation_fee = Column(Float)
    rating = Column(Float)
    is_active = Column(Boolean, default=True)


# -------------------- Config Master --------------------
class ConfigMaster(Base):
    __tablename__ = "config_master"

    id = Column(Integer, primary_key=True, index=True)
    config_type = Column(String, index=True)   # FAMILY_RELATION, SPECIALIZATION
    config_key = Column(String, nullable=False)
    config_value = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)


# -------------------- Family Members --------------------
class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    name = Column(String, nullable=False)
    relation = Column(String, nullable=False)  # from config_master
    age = Column(Integer)
    gender = Column(String)
