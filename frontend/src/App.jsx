import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Trips from "./pages/Trips";
import Itinerary from "./pages/Itinerary";
import Expenses from "./pages/Expenses";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Login />} /> {/* default route */}
        <Route path="/trips" element={<Trips />} />
        <Route path="/trips/:tripId/itinerary" element={<Itinerary />} />
        <Route path="/trips/:tripId/expenses" element={<Expenses />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
