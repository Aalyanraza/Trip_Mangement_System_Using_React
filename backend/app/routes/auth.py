from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from .. import schemas, user_model
from ..database import SessionLocal
import bcrypt


router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/register")
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = bcrypt.hashpw(user.password.encode('utf-8'), bcrypt.gensalt())
    new_user = user_model.User(name=user.name, email=user.email, password=hashed_pw.decode('utf-8'))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully"}

@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(user_model.User).filter(user_model.User.email == user.email).first()
    if not db_user or not bcrypt.checkpw(user.password.encode('utf-8'), db_user.password.encode('utf-8')):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    return {"message": "Login successful", "user": {"id": db_user.id, "name": db_user.name}}


@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(user_model.User).all()

@router.put("/user/{user_id}/update")
def update_user(user_id: int, updates: schemas.UserUpdate, db: Session = Depends(get_db)):
    # Find the user by ID
    user = db.query(user_model.User).filter(user_model.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Update name (email is not allowed to change)
    user.name = updates.name

    # If password is provided, hash and update it
    if updates.password:
        user.password = bcrypt.hashpw(updates.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    db.commit()

    # Return the updated user
    return {"message": "User updated successfully", "user": {"id": user.id, "name": user.name, "email": user.email}}