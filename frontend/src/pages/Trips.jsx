import { useState, useEffect, useContext } from "react";
import API from "../api";
import { UserContext } from "../UserContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Trips() {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [editingTrip, setEditingTrip] = useState(null);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      const res = await API.get(`/trips?user_id=${user.id}`);
      setTrips(res.data);
    } catch (err) {
      console.error("Error fetching trips:", err);
    }
  };

  const shareTrip = (tripId) => {
    fetch(`http://localhost:8000/trips/${tripId}/invite`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        const link = `http://localhost:5173/invite/${data.invite_token}`;
        navigator.clipboard.writeText(link);
        alert("Invite link copied!");
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await API.put(`/trips/${editingTrip.id}`, { name, destination });
      } else {
        await API.post(`/trips?user_id=${user.id}`, { name, destination });
      }
      setName("");
      setDestination("");
      setEditingTrip(null);
      fetchTrips();
    } catch (err) {
      console.error("Error saving trip:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/trips/${id}`);
      fetchTrips();
    } catch (err) {
      console.error("Error deleting trip:", err);
    }
  };

  const startEditing = (trip) => {
    setEditingTrip(trip);
    setName(trip.name);
    setDestination(trip.destination);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!user) return <p className="text-center mt-10">Please log in to view your trips.</p>;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center">My Trips</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Trip Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="w-full px-4 py-2 border rounded"
          required
        />
        <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          {editingTrip ? "Update Trip" : "Create Trip"}
        </button>
      </form>

      <ul className="space-y-2">
        {trips.map((trip) => (
          <li
            key={trip.id}
            className="flex justify-between items-center border px-4 py-2 rounded"
          >
            <div>
              <h3 className="font-semibold">{trip.name}</h3>
              <p className="text-sm text-gray-600">{trip.destination}</p>
            </div>
            <div className="flex flex-col space-y-1 text-right">
              <Link
                to={`/trips/${trip.id}/itinerary`}
                className="text-sm text-blue-600 hover:underline"
              >
                View Itinerary
              </Link>
              <Link
                to={`/trips/${trip.id}/expenses`}
                className="text-sm text-purple-600 hover:underline"
              >
                View Expenses
              </Link>
              <button
                onClick={() => startEditing(trip)}
                className="text-blue-600 text-sm hover:underline"
              >
                Edit
              </button>
              <button
                  onClick={() => navigate(`/trips/${trip.id}/location`)}
                  className="flex-1 bg-indigo-600 text-sm text-white py-2 px-2 rounded hover:bg-indigo-800"
                >
                  Share Location
                </button>
              <button
                onClick={() => handleDelete(trip.id)}
                className="text-red-600 text-sm hover:underline"
              >
                Delete
              </button>
              <button onClick={() => shareTrip(trip.id)}>Share</button>
              <Link to={`/trips/${trip.id}/chat`} className="text-sm text-green-600 hover:underline">
  Open Chat
</Link>

            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Trips;
