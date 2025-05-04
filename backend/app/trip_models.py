from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base
from sqlalchemy.orm import relationship
from .association import trip_participants  # if in a separate file


class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    destination = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    invites = relationship("TripInvite", back_populates="trip", cascade="all, delete")
    participants = relationship("User", secondary=trip_participants, back_populates="trips")


    
