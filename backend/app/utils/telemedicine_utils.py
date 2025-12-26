from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.database.models import Doctor, ConfigMaster, FamilyMember

# ---------------- Doctor Search ----------------
def search_doctors(db: Session, name: str = None, specialization: str = None):
    query = db.query(Doctor).filter(Doctor.is_active == True)

    if name:
        query = query.filter(Doctor.full_name.ilike(f"%{name}%"))

    if specialization:
        query = query.filter(Doctor.specialization.ilike(f"%{specialization}%"))

    return query.all()

# ---------------- Doctor Details ----------------
def get_doctor_by_id(db, doctor_id: int):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor

# ---------------- Config Fetch ----------------
def get_config_by_type(db: Session, config_type: str):
    return (
        db.query(ConfigMaster)
        .filter(ConfigMaster.config_type == config_type)
        .filter(ConfigMaster.is_active == True)
        .all()
    )

# ---------------- Family Members ----------------
def add_family_member(db: Session, user_id: int, data):
    member = FamilyMember(
        user_id=user_id,
        name=data.name,
        relation=data.relation,
        age=data.age,
        gender=data.gender,
    )
    db.add(member)
    db.commit()
    db.refresh(member)
    return member

def get_family_members(db: Session, user_id: int):
    return db.query(FamilyMember).filter(FamilyMember.user_id == user_id).all()
