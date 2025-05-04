import React from "react";
import { useNavigate, Link } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token"); // Assuming you're using token for auth
    navigate("/login"); // Redirect to login page
  };

  const handleChangeUserData = () => {
    navigate("/profile"); // Navigate to Profile Settings page
  };

  const handleViewTrips = () => {
    navigate("/trips"); // Navigate to Trips page
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>

      <div className="mb-4">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
          onClick={handleViewTrips}
        >
          View Trips
        </button>
      </div>

      <div className="mb-4">
        <Link
          to="/weather"
          className="text-white font-medium bg-blue-700 px-4 py-1 rounded hover:bg-white hover:text-blue-700 transition"
        >
          Weather
        </Link>
      </div>

      <div className="mb-4">
        <button
          className="bg-green-500 text-white px-4 py-2 rounded mb-2"
          onClick={handleChangeUserData}
        >
          Change Name/Password
        </button>
      </div>

      <div>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
