from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
from app.database.session import SessionLocal
from app.database.models import User
from app.auth.utils import hash_password, verify_password
from app.schemas.auth import SignupRequest, LoginRequest, UserPublic
from app.auth.jwt_handler import create_access_token, create_refresh_token, verify_token
import logging

router = APIRouter(prefix="/auth", tags=["auth"])
logger = logging.getLogger("my_app")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup", response_model=UserPublic)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == payload.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    logger.info(f"New user signed up: {user.username}")
    return user

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password_hash):
        logger.error(f"Login failed for username '{payload.username}'")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(data={"sub": user.username})
    logger.info(f"User logged in: {user.username}")
    # Newly added
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }
    # Newly added

@router.post("/refresh")
def refresh(token: str):
    payload = verify_token(token, expected_type="refresh")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    username = payload.get("sub")
    new_access_token = create_access_token(data={"sub": username})
    logger.info(f"Access token refreshed for user: {username}")
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserPublic)
def read_users_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_token(token, expected_type="access")
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

# Newly added
@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Generate a password reset token for the user"""
    from datetime import datetime, timedelta
    import secrets
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Don't reveal if email exists or not for security
        return {"message": "If that email exists, a reset link has been sent"}
    
    # Generate a secure random token
    reset_token = secrets.token_urlsafe(32)
    user.reset_token = reset_token
    user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
    
    db.commit()
    logger.info(f"Password reset requested for user: {user.username}")
    
    # In production, you would send this via email
    # For now, we return the token in the response
    return {
        "message": "Reset token generated",
        "reset_token": reset_token,
        "reset_link": f"http://localhost:5173/#/reset-password?token={reset_token}"
    }

@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset password using the token"""
    from datetime import datetime
    
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid reset token")
    
    if not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")
    
    # Update password and clear reset token
    user.password_hash = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    
    db.commit()
    logger.info(f"Password reset successful for user: {user.username}")
    
    return {"message": "Password reset successful"}
# Newly added

