from pydantic import BaseModel
from typing import Optional

class ItineraryCreate(BaseModel):
    name: str
    time: str
    notes: Optional[str] = None
    order: Optional[int] = None

class ItineraryOut(ItineraryCreate):
    id: int
    class Config:
        orm_mode = True
