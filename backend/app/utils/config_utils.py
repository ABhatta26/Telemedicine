# Config loader placeholder 
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.database.models import ConfigMaster


# ---------------- Get Config by Type ----------------
def get_config_by_type(db: Session, config_type: str):
    configs = (
        db.query(ConfigMaster)
        .filter(ConfigMaster.config_type == config_type)
        .all()
    )

    return configs


# ---------------- Get Single Config ----------------
def get_config_by_code(
    db: Session,
    config_type: str,
    code: str,
):
    config = (
        db.query(ConfigMaster)
        .filter(
            ConfigMaster.config_type == config_type,
            ConfigMaster.code == code,
        )
        .first()
    )

    if not config:
        raise HTTPException(status_code=404, detail="Config not found")

    return config


# ---------------- Create Config (Admin / Seed) ----------------
def create_config(
    db: Session,
    config_type: str,
    code: str,
    value: str,
):
    existing = (
        db.query(ConfigMaster)
        .filter(
            ConfigMaster.config_type == config_type,
            ConfigMaster.code == code,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Config already exists",
        )

    config = ConfigMaster(
        config_type=config_type,
        code=code,
        value=value,
    )

    db.add(config)
    db.commit()
    db.refresh(config)
    return config
