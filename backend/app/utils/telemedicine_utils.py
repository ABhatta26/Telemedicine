from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.database.models import Doctor, ConfigMaster, FamilyMember
from sqlalchemy import or_

# ---------------- Doctor Search ----------------
def search_doctors(
    db: Session,
    name: str | None = None,
    specialization: str | None = None
):
    query = db.query(Doctor)

    # 1️⃣ Search by doctor name (flexible)
    if name:
        query = query.filter(Doctor.name.ilike(f"%{name}%"))

    # 2️⃣ Flexible specialization search
    if specialization:
        spec = specialization.strip().lower()

        config = (
            db.query(ConfigMaster)
            .filter(ConfigMaster.config_type == "SPECIALIZATION")
            .filter(
                or_(
                    ConfigMaster.code.ilike(f"%{spec}%"),
                    ConfigMaster.value.ilike(f"%{spec}%")
                )
            )
            .first()
        )

        if not config:
            return []  # no matching specialization

        query = query.filter(Doctor.specialization == config.code)

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


# ------------------------ Health Report ----------------------------
from sqlalchemy.orm import Session
from app.database.models import HealthReport

def get_user_health_reports(db: Session, user_id: int):
    return (
        db.query(HealthReport)
        .filter(HealthReport.user_id == user_id)
        .order_by(HealthReport.uploaded_at.desc())
        .all()
    )

