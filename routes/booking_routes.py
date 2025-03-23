from flask import Blueprint, render_template, request, jsonify
from models import db, Booking, Trip
from flask_login import login_required
from sqlalchemy import text

booking_bp = Blueprint("booking", __name__)

# ✅ Route to Render the Bookings Page
@booking_bp.route("/bookings", methods=["GET"])
@login_required
def get_bookings():
    return render_template("bookings.html")

# ✅ API Route to Fetch All Bookings

@booking_bp.route("/api/bookings", methods=["GET"])
def get_bookings_api():
    query = text("""
        SELECT booking.id AS booking_id, 
               room.id AS room_id, 
               booking.date, 
               booking.status, 
               user.username
        FROM booking
        JOIN room ON booking.room_id = room.id
        JOIN user ON booking.user_id = user.id
    """)

    bookings = db.session.execute(query).fetchall()

    return jsonify([
        {
            "id": b.booking_id,  # Booking ID
            "room_number": b.room_id,  # Now correctly mapped
            "customer_name": b.username,
            "date": b.date,
            "status": b.status
        }
        for b in bookings
    ])


# ✅ Update Booking Status
@booking_bp.route("update/<int:booking_id>", methods=["PUT"])
@login_required
def update_booking(booking_id):
    data = request.get_json()
    booking = Booking.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    print(f"Updating Booking ID: {booking.id}, Current Status: {booking.status}")  # Debugging

    new_status = data.get("status")

    # Restrict updates based on current status
    if new_status == "Confirmed" and booking.status != "Pending":
        return jsonify({"error": "Only pending bookings can be confirmed"}), 400

    if new_status == "Cancelled" and booking.status not in ["Pending", "Confirmed"]:
        return jsonify({"error": "Only pending or confirmed bookings can be cancelled"}), 400

    booking.status = new_status
    db.session.commit()

    updated_booking = Booking.query.get(booking_id)  # Fetch again to confirm update
    print(f"Updated Status in DB: {updated_booking.status}")  # Debugging

    return jsonify({"message": f"Booking status updated to {new_status} successfully"})



# ✅ Delete a Booking
@booking_bp.route("delete/<int:booking_id>", methods=["DELETE"])
@login_required
def delete_booking(booking_id):
    booking = Trip.query.get(booking_id)

    if not booking:
        return jsonify({"error": "Booking not found"}), 404

    db.session.delete(booking)
    db.session.commit()

    return jsonify({"message": "Booking deleted successfully"})


# Fetch all trips
@booking_bp.route("api/trips", methods=["GET"])
def get_trips():
    trips = Trip.query.all()
    return jsonify([{
        "id": trip.id,
        "destination": trip.destination,
        "trip_type": trip.trip_type,
        "price": trip.price,
        "trip_date": trip.trip_date,
        "capacity": trip.capacity,
        "status": trip.status
    } for trip in trips])

# Update a trip
@booking_bp.route("update1/<int:trip_id>", methods=["PUT"])
def update_trip(trip_id):
    data = request.json
    print(data)
    trip = Trip.query.get_or_404(trip_id)

    trip.destination = data["destination"]
    trip.trip_type = data["trip_type"]
    trip.price = data["price"]
    trip.trip_date = data["trip_date"]
    trip.capacity = data["capacity"]
    trip.status = data["status"]

    db.session.commit()
    return jsonify({"message": "Trip updated successfully"})

# Delete a trip
@booking_bp.route("delete/<int:trip_id>", methods=["DELETE"])
def delete_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    db.session.delete(trip)
    db.session.commit()
    return jsonify({"message": "Trip deleted successfully"})
