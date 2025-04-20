from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base

class ItineraryItem(Base):
    __tablename__ = "itinerary"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    name = Column(String)
    time = Column(String)
    notes = Column(String)
    order = Column(Integer)
