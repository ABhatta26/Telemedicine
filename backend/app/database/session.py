# DB session placeholder 
from sqlalchemy import create_engine
 HEAD
from sqlalchemy.orm import sessionmaker, declarative_base
# Newly added
=======
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
>>>>>>> 3cd9f42565f16ff18ea0debf4a86c198eafa7d62
import os
from dotenv import load_dotenv

load_dotenv()

 HEAD
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./telemidicine.db")
# Newly added
=======
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./telemedicine.db")
>>>>>>> 3cd9f42565f16ff18ea0debf4a86c198eafa7d62

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# -------------------------
# Dependency for DB session
# -------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
