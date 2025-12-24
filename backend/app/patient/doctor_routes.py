from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.database.models import Doctor
from app.schemas.doctor import DoctorResponse
from fastapi import HTTPException


router = APIRouter()

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/doctors", response_model=list[DoctorResponse])
def search_doctors(
    name: str | None = Query(default=None),
    specialization: str | None = Query(default=None),
    db: Session = Depends(get_db)
):
    query = db.query(Doctor).filter(Doctor.status == "active")

    if name:
        query = query.filter(Doctor.name.ilike(f"%{name}%"))

    if specialization:
        query = query.filter(Doctor.specialization == specialization)

    return query.all()

@router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
def get_doctor_details(
    doctor_id: int,
    db: Session = Depends(get_db)
):
    doctor = (
        db.query(Doctor)
        .filter(
            Doctor.id == doctor_id,
            Doctor.status == "active"
        )
        .first()
    )

    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return doctor