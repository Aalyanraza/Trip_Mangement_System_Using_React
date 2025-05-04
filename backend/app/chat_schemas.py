from pydantic import BaseModel
from datetime import datetime

class ChatMessageCreate(BaseModel):
    message: str

class ChatMessageOut(BaseModel):
    id: int
    user_id: int
    message: str
    timestamp: datetime

    class Config:
        orm_mode = True
