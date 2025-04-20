from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import itinerary_models, itinerary_schemas
from ..database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/trips/{trip_id}/itinerary", response_model=itinerary_schemas.ItineraryOut)
def add_item(trip_id: int, item: itinerary_schemas.ItineraryCreate, db: Session = Depends(get_db)):
    new_item = itinerary_models.ItineraryItem(**item.dict(), trip_id=trip_id)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.get("/trips/{trip_id}/itinerary", response_model=list[itinerary_schemas.ItineraryOut])
def get_itinerary(trip_id: int, db: Session = Depends(get_db)):
    return db.query(itinerary_models.ItineraryItem).filter_by(trip_id=trip_id).order_by(itinerary_models.ItineraryItem.order).all()

@router.put("/itinerary/{item_id}")
def update_item(item_id: int, item: itinerary_schemas.ItineraryCreate, db: Session = Depends(get_db)):
    db_item = db.query(itinerary_models.ItineraryItem).filter_by(id=item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    for key, value in item.dict().items():
        setattr(db_item, key, value)

    db.commit()
    return {"message": "Itinerary item updated"}

@router.delete("/itinerary/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    db_item = db.query(itinerary_models.ItineraryItem).filter_by(id=item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted"}
