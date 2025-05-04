# app/invite_models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
import uuid

from .database import Base

class TripInvite(Base):
    __tablename__ = "trip_invites"

    id = Column(Integer, primary_key=True, index=True)
    trip_id = Column(Integer, ForeignKey("trips.id"))
    token = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))

    trip = relationship("Trip", back_populates="invites")
