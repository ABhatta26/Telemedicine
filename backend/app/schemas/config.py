from pydantic import BaseModel

class ConfigResponse(BaseModel):
    code: str
    value: str

    class Config:
        from_attributes = True
