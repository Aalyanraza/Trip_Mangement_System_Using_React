from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import auth
from .routes import auth, trip
from .trip_models import Base as TripBase
from .routes import itinerary
from .itinerary_models import Base as ItineraryBase
from .routes import expenses
from .expense_models import Base as ExpenseBase

app = FastAPI()

# CORS settings to allow frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
app.include_router(auth.router)
TripBase.metadata.create_all(bind=engine)
app.include_router(trip.router)
ItineraryBase.metadata.create_all(bind=engine)
app.include_router(itinerary.router)
ExpenseBase.metadata.create_all(bind=engine)
app.include_router(expenses.router)