from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import SessionLocal
from app.database.models import Configuration
from app.schemas.configuration import ConfigurationResponse

router = APIRouter()

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{item_code}", response_model=list[ConfigurationResponse])
def get_configuration(item_code: str, db: Session = Depends(get_db)):
    return (
        db.query(Configuration)
        .filter(
            Configuration.item_code == item_code,
            Configuration.status == "active"
        )
        .all()
    )
