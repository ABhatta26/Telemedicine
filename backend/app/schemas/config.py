from pydantic import BaseModel

class ConfigResponse(BaseModel):
    config_key: str
    config_value: str

    class Config:
        from_attributes = True
