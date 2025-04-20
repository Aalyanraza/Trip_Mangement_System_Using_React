from sqlalchemy import Column, Integer, String, Float, ForeignKey
from .database import Base

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    title = Column(String)
    amount = Column(Float)
    category = Column(String)
    notes = Column(String)
