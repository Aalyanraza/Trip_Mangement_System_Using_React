from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import trip_models, trip_schemas, user_model
from ..invite_models import TripInvite  # SQLAlchemy model

import uuid

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# -------------------
# INVITE ENDPOINTS
# -------------------

@router.post("/trips/{trip_id}/invite")
def generate_invite(trip_id: int, db: Session = Depends(get_db)):
    token = str(uuid.uuid4())
    invite = TripInvite(token=token, trip_id=trip_id)
    db.add(invite)
    db.commit()
    db.refresh(invite)
    return {"invite_token": invite.token}

@router.post("/invite/{token}")
def accept_invite(token: str, user_id: int, db: Session = Depends(get_db)):
    invite = db.query(TripInvite).filter_by(token=token).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invalid invite token")

    trip = db.query(trip_models.Trip).filter_by(id=invite.trip_id).first()
    user = db.query(user_model.User).filter_by(id=user_id).first()

    if not trip or not user:
        raise HTTPException(status_code=404, detail="Trip or user not found")

    # Associate user with the trip
    trip.participants.append(user)
    db.commit()

    return {"message": "Successfully joined trip", "trip_id": invite.trip_id}

# -------------------
# CRUD for Trips
# -------------------

@router.post("/trips", response_model=trip_schemas.TripOut)
def create_trip(trip: trip_schemas.TripCreate, user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_trip = trip_models.Trip(name=trip.name, destination=trip.destination, user_id=user_id)

    db_trip.participants.append(db_user)  # Add owner as participant
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/trips", response_model=list[trip_schemas.TripOut])
def get_trips(user_id: int, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter_by(id=user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.trips

@router.put("/trips/{trip_id}")
def update_trip(trip_id: int, trip: trip_schemas.TripCreate, db: Session = Depends(get_db)):
    db_trip = db.query(trip_models.Trip).filter(trip_models.Trip.id == trip_id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_trip.name = trip.name
    db_trip.destination = trip.destination
    db.commit()
    return {"message": "Trip updated successfully"}

@router.delete("/trips/{trip_id}")
def delete_trip(trip_id: int, db: Session = Depends(get_db)):
    db_trip = db.query(trip_models.Trip).filter(trip_models.Trip.id == trip_id).first()
    if not db_trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db.delete(db_trip)
    db.commit()
    return {"message": "Trip deleted"}
