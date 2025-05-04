
from sqlalchemy import Table, Column, Integer, ForeignKey
from .database import Base

trip_participants = Table(
    "trip_participants",
    Base.metadata,
    Column("trip_id", Integer, ForeignKey("trips.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
)