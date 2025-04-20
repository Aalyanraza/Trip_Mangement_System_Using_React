from sqlalchemy import Column, Integer, String, ForeignKey
from .database import Base

class Trip(Base):
    __tablename__ = "trips"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    destination = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
