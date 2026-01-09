#app/schemas/notification.py

from pydantic import BaseModel
from datetime import datetime

class NotificationResponse(BaseModel):
    id: int
    type: str
    message: str
    redirect_to: str | None
    is_read: bool
    created_at: datetime

    class Config:
        orm_mode = True
