from app.database.session import SessionLocal
from app.database.models import Notification, User
from datetime import datetime, timedelta

db = SessionLocal()

# 🔍 CHANGE THIS: pick an existing doctor user ID
DOCTOR_USER_ID = 1   # <-- replace with actual user.id

# Optional safety check
doctor = db.query(User).filter(User.id == DOCTOR_USER_ID).first()
if not doctor:
    print("❌ User not found")
    exit()

print(f"✅ Adding notifications for user: {doctor.username} ({doctor.role})")

notifications = [
    Notification(
        user_id=DOCTOR_USER_ID,
        type="appointment",
        message="New appointment booked",
        redirect_to="/appointments/123",
        is_read=False,
        created_at=datetime.utcnow()
    ),
    Notification(
        user_id=DOCTOR_USER_ID,
        type="reminder",
        message="Consultation reminder at 3 PM",
        redirect_to="/dashboard",
        is_read=False,
        created_at=datetime.utcnow() - timedelta(hours=1)
    ),
    Notification(
        user_id=DOCTOR_USER_ID,
        type="system",
        message="Profile verification completed",
        redirect_to="/settings",
        is_read=True,
        created_at=datetime.utcnow() - timedelta(days=1)
    ),
]

db.add_all(notifications)
db.commit()

print("🎉 Notifications inserted successfully!")

db.close()
