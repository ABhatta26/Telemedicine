from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.database.models import FamilyMember


def create_family_member(db: Session, user_id: int, data):
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


def fetch_family_members(db: Session, user_id: int):
    return db.query(FamilyMember).filter(
        FamilyMember.user_id == user_id
    ).all()

def update_family_photo(db: Session, member_id: int, photo_path: str):
    member = db.query(FamilyMember).filter(FamilyMember.id == member_id).first()
    member.photo_path = photo_path
    db.commit()
    return member.photo_path
