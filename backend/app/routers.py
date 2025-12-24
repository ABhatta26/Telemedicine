from fastapi import APIRouter
from app.configuration.routes import router as config_router
from app.patient.doctor_routes import router as patient_doctor_router
from app.patient.family_member_routes import router as family_member_router

router = APIRouter()

router.include_router(
    config_router,
    prefix="/configurations",
    tags=["Configurations"]
)

router.include_router(
    patient_doctor_router,
    prefix="/patient",
    tags=["Patient"]
)

router.include_router(
    family_member_router,
    prefix="/patient",
    tags=["Patient"]
)