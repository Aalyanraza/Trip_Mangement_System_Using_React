from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from sqlalchemy import Enum

import sqlite3

db = SQLAlchemy()

# User Table
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")

    bookings = db.relationship("Booking", backref="user", lazy=True)

    def is_management(self):
        return self.role == "management"


# Trip Table (Replaces Room Table)
class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(100), nullable=False)  
    trip_type = db.Column(db.String(50), nullable=False)     
    price = db.Column(db.Float, nullable=False)              
    trip_date = db.Column(db.String(20), nullable=False)      # Ensure this is added
    status = db.Column(db.String(20), nullable=False, default="Available") 
    capacity = db.Column(db.Integer, nullable=False)          

    def mark_as_booked(self):
        self.status = "Booked"

    def mark_as_available(self):
        self.status = "Available"


# Booking Table (Updated for Trips)
class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey("trip.id"), nullable=False)
    trip_date = db.Column(db.String(20), nullable=False)  # Date of the trip
    status = db.Column(Enum("Pending", "Confirmed", "Cancelled", name="booking_status"),
                       default="Pending", nullable=False, server_default="Pending")

    trip = db.relationship("Trip", backref="bookings")


# Function to initialize the database
def init_db(app):
    db.init_app(app)
    with app.app_context():
        db.create_all()


# Get available trips (Replaces room query logic)
def get_available_trips(date):
    conn = sqlite3.connect("hotel.db")
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, destination, trip_type, price FROM trip
        WHERE id NOT IN (SELECT trip_id FROM booking WHERE trip_date = ?)
        AND status = 'Available'
    """, (date,))

    trips = [{"id": row[0], "destination": row[1], "trip_type": row[2], "price": row[3]} for row in cursor.fetchall()]
    conn.close()

    return trips

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(10), unique=True, nullable=False)
    type = db.Column(db.String(50), nullable=False)  # Added missing column
    price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=True)  # This replaces availability

    def mark_as_booked(self):
        self.status = "Booked"  # Use a string instead of a boolean

    def mark_as_available(self):
        self.status = "Available"  # Use a string instead of a boolean

