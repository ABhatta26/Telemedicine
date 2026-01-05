from fastapi import FastAPI
import os
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from app.database.session import Base, engine, SessionLocal
from app.database.models import User
from app.auth.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
from app.utils.logger import setup_logger
from app.routers.routers import router as api_router
from app.routers.appointments import router as appointments_router
from fastapi.staticfiles import StaticFiles


# Load environment variables
load_dotenv()

API_BASE_URL = os.getenv("API_BASE_URL")

app = FastAPI(title="Telemedicine App")

# initialize logger once at startup
logger = setup_logger("logging.yaml")
logger.info("FastAPI app started")

app.add_middleware(
    CORSMiddleware,
    # Newly added - Allow both common Vite dev server ports
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # React dev server
    # Newly added
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables
Base.metadata.create_all(bind=engine)

# Newly added - Removed hardcoded admin seeding
# Users must now register through the signup endpoint
# No hardcoded credentials exist in the system
# Newly added

# Routers
app.include_router(auth_router)
app.include_router(api_router)
app.include_router(appointments_router)


@app.get("/")
def health():
    logger.info("Health check endpoint called")
    return {"status": "ok"}


os.makedirs("uploads", exist_ok=True)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

