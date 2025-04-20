from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import expense_models, expense_schemas
from ..database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/trips/{trip_id}/expenses", response_model=expense_schemas.ExpenseOut)
def add_expense(trip_id: int, expense: expense_schemas.ExpenseCreate, db: Session = Depends(get_db)):
    new_expense = expense_models.Expense(**expense.dict(), trip_id=trip_id)
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense

@router.get("/trips/{trip_id}/expenses", response_model=list[expense_schemas.ExpenseOut])
def get_expenses(trip_id: int, db: Session = Depends(get_db)):
    return db.query(expense_models.Expense).filter_by(trip_id=trip_id).all()

@router.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    expense = db.query(expense_models.Expense).filter_by(id=expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}
