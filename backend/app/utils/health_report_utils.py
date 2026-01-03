from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.database.models import HealthReport


def add_health_report(
    db: Session,
    user_id: int,
    file_name: str,
    file_path: str,
    report_type: str | None = None,
    family_member_id: int | None = None,
):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    report = HealthReport(
        user_id=user_id,
        family_member_id=family_member_id,  # None for user reports
        file_name=file_name,
        file_path=file_path,
        report_type=report_type,
    )

    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def get_user_reports(db: Session, user_id: int):
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")

    return (
        db.query(HealthReport)
        .filter(HealthReport.user_id == user_id)
        .filter(HealthReport.family_member_id.is_(None))  # ✅ correct NULL check
        .order_by(HealthReport.uploaded_at.desc())
        .all()
    )


def get_family_reports(db: Session, family_member_id: int):
    if not family_member_id:
        raise HTTPException(
            status_code=400,
            detail="Family member ID is required"
        )

    return (
        db.query(HealthReport)
        .filter(HealthReport.family_member_id == family_member_id)
        .order_by(HealthReport.uploaded_at.desc())
        .all()
    )
