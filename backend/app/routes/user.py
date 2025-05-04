from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import user_model, trip_models
from app.schemas import user_schemas

router = APIRouter()

@router.get("/users/{user_id}")
def get_user_info(user_id: int, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": user.id, "name": user.name, "email": user.email}

@router.put("/users/{user_id}/update")
def update_user(user_id: int, updates: user_schemas.UserUpdate, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if updates.name:
        user.name = updates.name
    if updates.password:
        user.password = updates.password  # You should hash the password if you're updating it
    
    db.commit()
    db.refresh(user)
    return {"message": "User updated successfully", "user": {"id": user.id, "name": user.name, "email": user.email}}

@router.get("/users/{user_id}/trips")
def get_user_trips(user_id: int, db: Session = Depends(get_db)):
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user.trips
