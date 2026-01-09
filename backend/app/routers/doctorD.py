from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.database.session import get_db
from app.database.doctorD import Appointment, Request, DoctorSettings, ChatMessage
from app.schemas.doctorD import AppointmentSchema, RequestSchema, StatusUpdate,ChatMessageCreate, ChatMessageOut,CombinedRecordsSchema




# Create the router
router = APIRouter(
    prefix="/api",
    tags=["Doctor Dashboard"]
)

# API 1: Get Today's Schedule DONE
@router.get("/appointments", response_model=List[AppointmentSchema])
def get_appointments(db: Session = Depends(get_db)):
    return db.query(Appointment).filter(Appointment.date == "today").all()


@router.get("/allappointments", response_model=List[AppointmentSchema])
def get_appointments(db: Session = Depends(get_db)):
    """
    Fetch all appointments. 
    The frontend (React) will handle filtering for 'Today' or 'This Week'.
    """
    appointments = db.query(Appointment).all()
    return appointments

# API 2: Get Pending Requests DONE
@router.get("/requests", response_model=List[RequestSchema])
def get_requests(db: Session = Depends(get_db)):
    return db.query(Request).filter(Request.status == "pending").all()

# API 3: Get Live Consultation Data DONE
@router.get("/consultation/live")
def get_live_consultation(db: Session = Depends(get_db)):
    current = db.query(Appointment).filter(Appointment.status == "In Progress").first()
    if current:
        return {
            "active": True,
            "patient_name": current.patient_name,
            "type": current.type,
            "tags": ["Migraine History"],
            "timer_start": datetime.now().isoformat()
        }
    return {"active": False}

# API 4: Get Dashboard Stats
@router.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "avg_rating": 4.8,
        "total_patients": 12,
        "requests_count": db.query(Request).filter(Request.status == "pending").count()
    }

# API 5: Toggle Availability  //
@router.patch("/doctor/status")
def update_status(status: StatusUpdate, db: Session = Depends(get_db)):
    settings = db.query(DoctorSettings).first()
    # If settings don't exist yet, create them
    if not settings:
        settings = DoctorSettings(is_online=True)
        db.add(settings)
    
    settings.is_online = status.is_online
    db.commit()
    return {"status": "updated", "is_online": settings.is_online}



# API 6: Action on Request (Approve/Reject) DONE
@router.post("/requests/{request_id}/{action}")
def handle_request(request_id: int, action: str, db: Session = Depends(get_db)):
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if action not in ["approve", "reject"]:
        raise HTTPException(status_code=400, detail="Invalid action")

    req.status = "approved" if action == "approve" else "rejected"
    db.commit()
    return {"message": f"Request {action}d successfully"}



# API 7: Get Chat History for a specific patient  DONE
@router.get("/chat/history/{patient_id}", response_model=List[ChatMessageOut])
def get_chat_history(patient_id: int, db: Session = Depends(get_db)):
    messages = db.query(ChatMessage).filter(ChatMessage.patient_id == patient_id).all()
    return messages


# API 8 : Send/Save a new message DONE
@router.post("/chat/send", response_model=ChatMessageOut)
def send_message(msg: ChatMessageCreate, db: Session = Depends(get_db)):
    new_msg = ChatMessage(
        patient_id=msg.patientId,
        sender=msg.sender,
        text=msg.text,
        timestamp=datetime.utcnow()
    )
    
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    
    return new_msg


from app.schemas.doctorD import RequestSchema


# ---------------------------------------------------------
# API 8: Get Requests with Status Filter        DONE
# ---------------------------------------------------------
@router.get("/appointments/requests", response_model=List[RequestSchema])
def get_appointment_requests(
    status: str = Query("pending", description="Filter requests by status (e.g., pending, approved)"),
    db: Session = Depends(get_db)
):
    """
    Fetches appointment requests.
    By default, it filters for 'pending' requests unless a different status is provided.
    """
    # 1. Query the 'requests' table
    query = db.query(Request)
    
    # 2. Apply filter if status is provided
    if status:
        query = query.filter(Request.status == status)
        
    # 3. Return results
    return query.all()

# Add CombinedRecordsSchema to your imports from schemas




# API 9: Get All Appointments & Processed Requests     DONE

@router.get("/all-records", response_model=CombinedRecordsSchema)
def get_all_records(db: Session = Depends(get_db)):
    """
    Fetches:
    1. All appointments from the Appointment table.
    2. All requests where status is NOT 'pending' (e.g., approved/rejected).
    """
    
    # 1. Get ALL Appointments
    all_appointments = db.query(Appointment).all()
    
    # 2. Get Requests where status is NOT "pending"
    # We use the != operator which SQLAlchemy translates to SQL '!='
    processed_requests = db.query(Request).filter(Request.status != "pending").all()
    
    # 3. Return combined data
    return {
        "appointments": all_appointments,
        "request_history": processed_requests
    }
