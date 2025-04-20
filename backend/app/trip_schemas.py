from pydantic import BaseModel

class TripCreate(BaseModel):
    name: str
    destination: str

class TripOut(BaseModel):
    id: int
    name: str
    destination: str

    class Config:
        orm_mode = True
