# =================================================
# Imports
# =================================================
from fastapi import (
    APIRouter, Depends, Query,
    UploadFile, File, Form, HTTPException
)
from sqlalchemy.orm import Session
import os, shutil

from app.database.session import get_db
from app.auth.jwt_handler import get_current_user
from app.database.models import FamilyMember, HealthReport, User

# Utils
from app.utils.family_utils import (
    create_family_member,
    fetch_family_members,
    update_family_photo,
)
from app.utils.user_utils import (
    update_user_photo,
    fetch_user_photo
)
from app.utils.health_report_utils import (
    add_health_report,
    get_user_reports,
    get_family_reports
)
from app.utils.doctor_utils import (
    search_doctors,
    get_doctor_by_id,
)
from app.utils.config_utils import (
    get_config_by_type,
)
from app.utils.upload_utils import (
    save_file,
)

# Schemas
from app.schemas.doctor import DoctorResponse
from app.schemas.config import ConfigResponse
from app.schemas.family import FamilyCreate, FamilyResponse
from app.schemas.health_report import HealthReportResponse

# =================================================
# Router Init
# =================================================
router = APIRouter(
    prefix="/api",
    tags=["Telemedicine"]
)

# =================================================
# DOCTOR APIs
# =================================================
@router.get("/doctors/search", response_model=list[DoctorResponse])
def doctor_search(
    name: str | None = Query(None),
    specialization: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return search_doctors(db, name, specialization)


@router.get("/doctors/{doctor_id}", response_model=DoctorResponse)
def doctor_details(
    doctor_id: int,
    db: Session = Depends(get_db),
):
    return get_doctor_by_id(db, doctor_id)

# =================================================
# CONFIG APIs
# =================================================
@router.get("/config/{config_type}", response_model=list[ConfigResponse])
def get_config(
    config_type: str,
    db: Session = Depends(get_db),
):
    return get_config_by_type(db, config_type)

# =================================================
# FAMILY MEMBER APIs
# =================================================
@router.post("/family-member", response_model=FamilyResponse)
def add_family_member(
    data: FamilyCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return create_family_member(db, user.id, data)

@router.get("/family-member", response_model=list[FamilyResponse])
def get_family_members(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    return fetch_family_members(db, user.id)


# =================================================
# FAMILY MEMBER PHOTO APIs
# =================================================
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

    return {"photo_url": f"/{file_path}"}


@router.get("/family-member/{member_id}/photo")
def get_family_photo(
    member_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id
    ).first()

    if not member or not member.photo_path:
        raise HTTPException(status_code=404, detail="Photo not found")

    return {"photo_url": f"/{member.photo_path}"}

# =================================================
# USER PROFILE PHOTO APIs
# =================================================
@router.post("/user/profile/photo")
def upload_user_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    upload_dir = "uploads/users"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{user.id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    update_user_photo(
        db=db,
        user_id=user.id,
        photo_path=file_path,
    )

    return {"photo_url": f"/{file_path}"}


@router.get("/user/profile/photo")
def get_user_photo(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    photo_path = fetch_user_photo(db, user.id)

    return {"photo_url": f"/{photo_path}"}


# =================================================
# HEALTH REPORT APIs (USER)
# =================================================
@router.get("/health-reports", response_model=list[HealthReportResponse])
def get_health_timeline(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    reports = get_user_reports(db, user.id)

    for r in reports:
        r.file_url = f"/{r.file_path}"

    return reports


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

    report.file_url = f"/{file_path}"
    return report

# =================================================
# FAMILY MEMBER HEALTH REPORT APIs
# =================================================
@router.post("/family-member/{member_id}/health-reports")
def upload_family_member_health_report(
    member_id: int,
    file: UploadFile = File(...),
    report_type: str | None = Form(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")

    upload_dir = "uploads/family_reports"
    os.makedirs(upload_dir, exist_ok=True)

    file_path = f"{upload_dir}/{member_id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    report = add_health_report(
        db=db,
        user_id=member_id,
        file_name=file.filename,
        file_path=file_path,
        report_type=report_type,
    )

    report.file_url = f"/{file_path}"
    return report


@router.get(
    "/family-member/{member_id}/health-reports",
    response_model=list[HealthReportResponse]
)
def get_family_member_health_reports(
    member_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    member = db.query(FamilyMember).filter(
        FamilyMember.id == member_id,
        FamilyMember.user_id == user.id
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Family member not found")

    reports = (
        db.query(HealthReport)
        .filter(HealthReport.user_id == member_id)
        .order_by(HealthReport.uploaded_at.desc())
        .all()
    )

    for r in reports:
        r.file_url = f"/{r.file_path}"

    return reports
