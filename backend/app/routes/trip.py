from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import SessionLocal
from .. import trip_models, trip_schemas, models

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/trips", response_model=trip_schemas.TripOut)
def create_trip(trip: trip_schemas.TripCreate, user_id: int, db: Session = Depends(get_db)):
    db_trip = trip_models.Trip(name=trip.name, destination=trip.destination, user_id=user_id)
    db.add(db_trip)
    db.commit()
    db.refresh(db_trip)
    return db_trip

@router.get("/trips", response_model=list[trip_schemas.TripOut])
def get_trips(user_id: int, db: Session = Depends(get_db)):
    return db.query(trip_models.Trip).filter(trip_models.Trip.user_id == user_id).all()

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
