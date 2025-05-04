from sqlalchemy import Column, Integer, String
from .database import Base
from sqlalchemy import Table, Column, Integer, ForeignKey
from .database import Base
from .association import trip_participants  # adjust path as needed
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    trips = relationship("Trip", secondary=trip_participants, back_populates="participants")



