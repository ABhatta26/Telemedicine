#app/routers/routers.py

# Routers registration placeholder 
from fastapi import APIRouter, Depends, Query, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.auth.jwt_handler import get_current_user
from app.database.models import FamilyMember
import os
import shutil
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