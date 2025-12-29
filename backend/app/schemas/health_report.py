from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class HealthReportResponse(BaseModel):
    id: int
    file_name: str
    file_url: str
    report_type: str | None
    uploaded_at: datetime

    class Config:
        from_attributes = True
class HealthReportCreate(BaseModel):
    report_type: Optional[str] = None
