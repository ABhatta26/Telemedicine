from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import date, datetime
from typing import List

from app.database.session import get_db
from app.database.models import Appointment, User, Doctor
from app.schemas.appointment import (
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentResponse,
    AppointmentStats
)
from app.auth.jwt_handler import get_current_user

router = APIRouter(prefix="/api", tags=["appointments"])

# ==========================================
# PATIENT ENDPOINTS
# ==========================================

@router.post("/appointments", response_model=AppointmentResponse)
def create_appointment(
    data: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new appointment (patient only)"""
    
    # Verify doctor exists
    doctor = db.query(Doctor).filter(Doctor.id == data.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create appointment
    appointment = Appointment(
        patient_id=current_user.id,
        doctor_id=data.doctor_id,
        appointment_date=data.appointment_date,
        appointment_time=data.appointment_time,
        reason=data.reason,
        status="scheduled"
    )
    
    db.add(appointment)
    db.commit()
    db.refresh(appointment)
    
    # Add patient and doctor names for response
    response = AppointmentResponse.from_orm(appointment)
    response.patient_name = current_user.username
    response.doctor_name = doctor.name
    
    return response


@router.get("/appointments", response_model=List[AppointmentResponse])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all appointments for the current user"""
    
    appointments = db.query(Appointment).filter(
        Appointment.patient_id == current_user.id
    ).order_by(Appointment.appointment_date.desc()).all()
    
    # Enrich with patient and doctor names
    result = []
    for apt in appointments:
        doctor = db.query(Doctor).filter(Doctor.id == apt.doctor_id).first()
        response = AppointmentResponse.from_orm(apt)
        response.patient_name = current_user.username
        response.doctor_name = doctor.name if doctor else "Unknown"
        result.append(response)
    
    return result


@router.get("/appointments/{appointment_id}", response_model=AppointmentResponse)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific appointment"""
    
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    response = AppointmentResponse.from_orm(appointment)
    response.patient_name = current_user.username
    response.doctor_name = doctor.name if doctor else "Unknown"
    
    return response


@router.patch("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: int,
    data: AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update appointment status or reschedule"""
    
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Update fields
    if data.status:
        appointment.status = data.status
    if data.appointment_date:
        appointment.appointment_date = data.appointment_date
    if data.appointment_time:
        appointment.appointment_time = data.appointment_time
    
    db.commit()
    db.refresh(appointment)
    
    doctor = db.query(Doctor).filter(Doctor.id == appointment.doctor_id).first()
    response = AppointmentResponse.from_orm(appointment)
    response.patient_name = current_user.username
    response.doctor_name = doctor.name if doctor else "Unknown"
    
    return response


@router.delete("/appointments/{appointment_id}")
def cancel_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel an appointment"""
    
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.patient_id == current_user.id
    ).first()
    
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    appointment.status = "cancelled"
    db.commit()
    
    return {"message": "Appointment cancelled successfully"}


# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@router.get("/admin/appointments/stats", response_model=AppointmentStats)
def get_appointment_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get appointment statistics for admin dashboard"""
    
    # Check if user is admin
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = date.today()
    
    # Today's appointments (all statuses)
    total_today = db.query(Appointment).filter(
        Appointment.appointment_date == today
    ).count()
    
    # Upcoming appointments (scheduled, future dates)
    upcoming = db.query(Appointment).filter(
        and_(
            Appointment.appointment_date > today,
            Appointment.status == "scheduled"
        )
    ).count()
    
    # Completed appointments
    completed = db.query(Appointment).filter(
        Appointment.status == "completed"
    ).count()
    
    # Cancelled appointments
    cancelled = db.query(Appointment).filter(
        Appointment.status == "cancelled"
    ).count()
    
    # Rescheduled appointments
    rescheduled = db.query(Appointment).filter(
        Appointment.status == "rescheduled"
    ).count()
    
    # Today's scheduled appointments
    today_scheduled = db.query(Appointment).filter(
        and_(
            Appointment.appointment_date == today,
            Appointment.status == "scheduled"
        )
    ).count()
    
    return AppointmentStats(
        today=today_scheduled,
        upcoming=upcoming,
        completed=completed,
        cancelled=cancelled,
        rescheduled=rescheduled,
        total_today=total_today
    )


@router.get("/admin/appointments/today", response_model=List[AppointmentResponse])
def get_today_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all appointments for today (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = date.today()
    appointments = db.query(Appointment).filter(
        Appointment.appointment_date == today
    ).order_by(Appointment.appointment_time).all()
    
    # Enrich with patient and doctor names
    result = []
    for apt in appointments:
        patient = db.query(User).filter(User.id == apt.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == apt.doctor_id).first()
        
        response = AppointmentResponse.from_orm(apt)
        response.patient_name = patient.username if patient else "Unknown"
        response.doctor_name = doctor.name if doctor else "Unknown"
        result.append(response)
    
    return result


@router.get("/admin/appointments/upcoming", response_model=List[AppointmentResponse])
def get_upcoming_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all upcoming appointments (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = date.today()
    appointments = db.query(Appointment).filter(
        and_(
            Appointment.appointment_date > today,
            Appointment.status == "scheduled"
        )
    ).order_by(Appointment.appointment_date, Appointment.appointment_time).all()
    
    # Enrich with patient and doctor names
    result = []
    for apt in appointments:
        patient = db.query(User).filter(User.id == apt.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == apt.doctor_id).first()
        
        response = AppointmentResponse.from_orm(apt)
        response.patient_name = patient.username if patient else "Unknown"
        response.doctor_name = doctor.name if doctor else "Unknown"
        result.append(response)
    
    return result


@router.get("/admin/appointments/past", response_model=List[AppointmentResponse])
def get_past_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all past appointments (admin only)"""
    
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    today = date.today()
    appointments = db.query(Appointment).filter(
        Appointment.appointment_date < today
    ).order_by(Appointment.appointment_date.desc()).all()
    
    # Enrich with patient and doctor names
    result = []
    for apt in appointments:
        patient = db.query(User).filter(User.id == apt.patient_id).first()
        doctor = db.query(Doctor).filter(Doctor.id == apt.doctor_id).first()
        
        response = AppointmentResponse.from_orm(apt)
        response.patient_name = patient.username if patient else "Unknown"
        response.doctor_name = doctor.name if doctor else "Unknown"
        result.append(response)
    
    return result
