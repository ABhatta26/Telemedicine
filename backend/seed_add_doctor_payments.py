from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.database.session import SessionLocal
from app.database.models import DoctorPayment, PaymentStatus

db: Session = SessionLocal()

# ⚠️ IMPORTANT:
# doctor_id MUST be the logged-in user's ID
DOCTOR_ID = 1   # <-- change this to your actual user.id

payments = [
    DoctorPayment(
        doctor_id=DOCTOR_ID,
        patient_name="Rahul Sharma",
        amount=500,
        method="UPI",
        status=PaymentStatus.completed,
        created_at=datetime.utcnow() - timedelta(days=1),
    ),
    DoctorPayment(
        doctor_id=DOCTOR_ID,
        patient_name="Anjali Gupta",
        amount=800,
        method="Card",
        status=PaymentStatus.completed,
        created_at=datetime.utcnow() - timedelta(days=5),
    ),
    DoctorPayment(
        doctor_id=DOCTOR_ID,
        patient_name="Vikram Singh",
        amount=600,
        method="UPI",
        status=PaymentStatus.pending,
        created_at=datetime.utcnow() - timedelta(days=2),
    ),
    DoctorPayment(
        doctor_id=DOCTOR_ID,
        patient_name="Sneha Roy",
        amount=1000,
        method="Cash",
        status=PaymentStatus.completed,
        created_at=datetime.utcnow() - timedelta(days=20),
    ),
]

db.add_all(payments)
db.commit()
db.close()

print("✅ Doctor payments added successfully")
