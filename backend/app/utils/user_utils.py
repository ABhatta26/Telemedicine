from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.database.models import User


def update_user_photo(
    db: Session,
    user_id: int,
    photo_path: str,
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.photo = photo_path   # ✅ FIXED
    db.commit()
    db.refresh(user)

    return user


def fetch_user_photo(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()

    if not user or not user.photo:   # ✅ FIXED
        raise HTTPException(
            status_code=404,
            detail="Profile photo not found"
        )

    return user.photo
