from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException

from app.database.models import Doctor, ConfigMaster


# ---------------- Doctor Search ----------------
def search_doctors(
    db: Session,
    name: str | None = None,
    specialization: str | None = None,
):
    query = db.query(Doctor)

    # 🔹 Search by doctor name
    if name:
        query = query.filter(Doctor.name.ilike(f"%{name}%"))

    # 🔹 Search by specialization (via config_master)
    if specialization:
        spec = specialization.strip().lower()

        config = (
            db.query(ConfigMaster)
            .filter(ConfigMaster.config_type == "SPECIALIZATION")
            .filter(
                or_(
                    ConfigMaster.code.ilike(f"%{spec}%"),
                    ConfigMaster.value.ilike(f"%{spec}%"),
                )
            )
            .first()
        )

        if not config:
            # No matching specialization config
            return []

        query = query.filter(Doctor.specialization == config.code)

    return query.all()


# ---------------- Doctor Details ----------------
def get_doctor_by_id(db: Session, doctor_id: int):
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor


# ---------------- Create Doctor (Optional/Admin) ----------------
def create_doctor(
    db: Session,
    name: str,
    specialization: str,
    experience: int,
    consultation_fee: int,
):
    doctor = Doctor(
        name=name,
        specialization=specialization,  # must be config.code
        experience=experience,
        consultation_fee=consultation_fee,
    )
    db.add(doctor)
    db.commit()
    db.refresh(doctor)
    return doctor
