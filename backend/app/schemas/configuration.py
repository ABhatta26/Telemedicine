from pydantic import BaseModel

class ConfigurationResponse(BaseModel):
    id: int
    item_code: str
    item_name: str

    class Config:
        from_attributes = True
