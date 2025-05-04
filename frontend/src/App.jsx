import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Trips from "./pages/Trips";
import Itinerary from "./pages/Itinerary";
import Expenses from "./pages/Expenses";
import Invite from './pages/Invite';
import TripChat from "./pages/TripChat";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import ProfileSettings from "./pages/ProfileSettings";
import Dashboard from "./pages/dashboard";
import WeatherPage from "./pages/WeatherPage"; // Adjust path as needed
import LocationSharing from "./pages/LocationSharing";




function App() {
  const { user, loading } = useContext(UserContext);
  if (loading) return <div>Loading...</div>;
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} /> {/* default route */}
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId/itinerary" element={<Itinerary />} />
        <Route path="/trips/:tripId/expenses" element={<Expenses />} />
        <Route path="/invite/:token" element={<Invite />} />
        <Route path="/trips/:tripId/chat" element={<TripChat user={user} />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/weather" element={<WeatherPage />} />
        <Route path="/trips/:tripId/location" element={<LocationSharing />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
