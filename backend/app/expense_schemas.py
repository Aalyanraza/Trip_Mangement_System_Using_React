from pydantic import BaseModel
from typing import Optional

class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    notes: Optional[str] = ""

class ExpenseOut(ExpenseCreate):
    id: int

    class Config:
        orm_mode = True
