from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.database.models import FamilyMember
from app.schemas.family_member import (
    FamilyMemberCreate,
    FamilyMemberResponse
)

router = APIRouter()

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/family-members", response_model=FamilyMemberResponse)
def add_family_member(
    data: FamilyMemberCreate,
    db: Session = Depends(get_db)
):
    member = FamilyMember(**data.dict())
    db.add(member)
    db.commit()
    db.refresh(member)
    return member


@router.get("/family-members/{patient_id}", response_model=list[FamilyMemberResponse])
def list_family_members(
    patient_id: int,
    db: Session = Depends(get_db)
):
    return (
        db.query(FamilyMember)
        .filter(FamilyMember.patient_id == patient_id)
        .all()
    )
