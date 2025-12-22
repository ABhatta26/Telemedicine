from fastapi import FastAPI
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.database.models import User
from app.auth.routes import router as auth_router
from app.routers import router as api_router
from app.auth.utils import hash_password
from fastapi.middleware.cors import CORSMiddleware
from app.utils.logger import setup_logger

# Load environment variables
load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL")

app = FastAPI(title="Telemedicine App")

# initialize logger once at startup
logger = setup_logger("logging.yaml")
logger.info("FastAPI app started")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Seed default admin if missing
def seed_admin():
    db: Session = SessionLocal()
    try:
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@example.com",
                phone="0000000000",
                role="admin",
                password_hash=hash_password("admin123"),
            )
            db.add(admin)
            db.commit()
            logger.info("Default admin user created")
        else:
            logger.debug("Admin user already exists")
    finally:
        db.close()

seed_admin()

# Routers
app.include_router(auth_router)
app.include_router(api_router)

@app.get("/")
def health():
    logger.info("Health check endpoint called")
    return {"status": "ok"}
