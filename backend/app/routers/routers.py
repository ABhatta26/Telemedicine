# Routers registration placeholder 
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import exists
from app.database.session import get_db
from app.auth.jwt_handler import get_current_user
from app.database.models import FamilyMember,Patient,Booking,Payment


import os
import shutil
from enum import Enum
from typing import List
from fastapi import Form


from app.utils.telemedicine_utils import (
    search_doctors,
    get_config_by_type,
    add_family_member,
    get_family_members,
)

from app.schemas.doctor import DoctorResponse
from app.schemas.config import ConfigResponse
from app.schemas.family import FamilyCreate, FamilyResponse
from app.schemas.health_report import HealthReportResponse
from app.utils.telemedicine_utils import get_user_health_reports
from app.schemas.health_report import HealthReportCreate
from app.utils.telemedicine_utils import add_health_report
from app.schemas.patient import DashboardStats,PatientDashboardView



router = APIRouter(
    prefix="/api",
    tags=["Telemedicine"]
)

# -------------------------------------------------
# Doctor Search
# -------------------------------------------------
@router.get("/doctors/search", response_model=list[DoctorResponse])
def doctor_search(
    name: str | None = Query(None),
    specialization: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return search_doctors(db, name, specialization)

# -------------------------------------------------
# Doctor Details (After Click)
# -------------------------------------------------
@router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
def doctor_details(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    from app.utils.telemedicine_utils import get_doctor_by_id
    return get_doctor_by_id(db, doctor_id)


# -------------------------------------------------
# Config Dropdowns (FAMILY_RELATION, SPECIALIZATION)
# -------------------------------------------------
@router.get("/config/{config_type}", response_model=list[ConfigResponse])
def get_config(
    config_type: str,
    db: Session = Depends(get_db),
):
    return get_config_by_type(db, config_type)


# -------------------------------------------------
# Family Members
# -------------------------------------------------
@router.post("/family-member", response_model=FamilyResponse)
def create_family_member(
    data: FamilyCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return add_family_member(db, user.id, data)


@router.get("/family-member", response_model=list[FamilyResponse])
def list_family_members(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return get_family_members(db, user.id)


# -------------------------------------------------
# Upload Family Member Photo
# -------------------------------------------------
@router.post("/family-member/{member_id}/photo")
def upload_family_photo(
    member_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")

    upload_dir = "uploads/family"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{member_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    member.photo_path = file_path
    db.commit()

    return {
        "message": "Family photo uploaded successfully",
        "photo_url": f"/{file_path}"
    }



# -------------------------------------------------
# Health Report Timeline
# -------------------------------------------------
@router.get("/health-reports",response_model=list[HealthReportResponse]
)
def get_health_timeline(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    reports = get_user_health_reports(db, user.id)

    # Convert file_path to public URL
    for r in reports:
        r.file_url = f"/uploads/{r.file_path}"

    return reports

# -------------------------------------------------
# Upload Health Report
# -------------------------------------------------
@router.post("/health-reports", response_model=HealthReportResponse)
def upload_health_report(
    file: UploadFile = File(...),
    report_type: str | None = Form(None), 
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    upload_dir = "uploads/health_reports"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{user.id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    report = add_health_report(
        db=db,
        user_id=user.id,
        file_name=file.filename,
        file_path=file_path,
        report_type=report_type,
    )

    # convert to public URL
    report.file_url = f"/uploads/health_reports/{user.id}_{file.filename}"

    return report


# Patient Admin Dashboard

@router.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats( db: Session = Depends(get_db)):
    """
    Optimized: Uses 3 fast count queries.
    """
    total = db.query(Patient).count()
    
    # Count distinct patients who have at least one active booking
    active = db.query(Patient.id).join(Booking).filter(Booking.is_active == True).distinct().count()
    
    # Count distinct patients who have at least one pending payment
    pending = db.query(Patient.id).join(Payment).filter(Payment.is_pending == True).distinct().count()

    return DashboardStats(
        total_patients=total,
        patients_with_active_bookings=active,
        patients_with_pending_payments=pending
    )

@router.get("/dashboard/patients", response_model=List[PatientDashboardView])
def get_patients_for_dashboard(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """
    Instead of looping through patients and checking bookings (N+1 problem),
    we annotate the query to return boolean flags in the main SQL fetch.
    """
    
    # Define subqueries for existence checks
    has_booking_stmt = exists().where(Booking.patient_id == Patient.id, Booking.is_active == True)
    has_payment_stmt = exists().where(Payment.patient_id == Patient.id, Payment.is_pending == True)

    # Query: Select Patient + calculated booleans
    results = db.query(
        Patient,
        has_booking_stmt.label("has_active_booking"),
        has_payment_stmt.label("has_pending_payment")
    ).offset(skip).limit(limit).all()

    # Map the raw SQL result to our Pydantic Schema
    response = []
    for patient, has_booking, has_payment in results:
        response.append(PatientDashboardView(
            id=patient.id,
            full_name=patient.full_name,
            age=patient.age,
            gender=patient.gender,
            has_active_booking=has_booking,
            has_pending_payment=has_payment
        ))
    
    return response

# --- 5. SEED DATA GENERATOR (To Test It) ---
@router.post("/seed")
def seed_data(db: Session = Depends(get_db)):
    # Clean up old data
    db.query(Booking).delete()
    db.query(Payment).delete()
    db.query(Patient).delete()
    
    # Patient 1: Has everything (Active Booking + Pending Payment)
    p1 = Patient(full_name="John Doe", age=30, gender="Male", medical_history="Confidential 1")
    db.add(p1)
    db.commit()
    db.add(Booking(patient_id=p1.id, is_active=True))
    db.add(Payment(patient_id=p1.id, is_pending=True))
    
    # Patient 2: Clear (No active booking, Paid up)
    p2 = Patient(full_name="Jane Smith", age=25, gender="Female", medical_history="Confidential 2")
    db.add(p2)
    db.commit()
    # Old inactive booking, Paid payment
    db.add(Booking(patient_id=p2.id, is_active=False))
    db.add(Payment(patient_id=p2.id, is_pending=False))

    db.commit()
    return {"status": "Database seeded with 2 test patients"}
