import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import API from "../api";
import { UserContext } from "../UserContext";

// Fix default icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom marker icons
const currentLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const markedLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

const LocationSharing = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [location, setLocation] = useState(null);
  const [markedLocation, setMarkedLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMarking, setIsMarking] = useState(false);
  const mapRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            user: user?.name || "You",
          });
          setLoading(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          setError("Failed to get your location. Please allow location access.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (isMarking) {
      const newMarkedLocation = {
        latitude: latlng.lat,
        longitude: latlng.lng,
        name: "Marked Location",
        tripId: tripId
      };
      setMarkedLocation(newMarkedLocation);
      // Save to localStorage
      localStorage.setItem(`markedLocation_${tripId}`, JSON.stringify(newMarkedLocation));
      setIsMarking(false);
    }
  };

  const startMarking = () => {
    setIsMarking(true);
  };

  const clearMarkedLocation = () => {
    setMarkedLocation(null);
    setDistance(null);
    localStorage.removeItem(`markedLocation_${tripId}`);
  };

  useEffect(() => {
    if (location && markedLocation) {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        markedLocation.latitude,
        markedLocation.longitude
      );
      setDistance(dist);
    }
  }, [location, markedLocation]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Load marked location from localStorage
    const savedMarkedLocation = localStorage.getItem(`markedLocation_${tripId}`);
    if (savedMarkedLocation) {
      setMarkedLocation(JSON.parse(savedMarkedLocation));
    }

    fetchLocation();
  }, [user, tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-200 flex items-center justify-center">
        <p className="text-lg text-white">Loading location data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-200 flex flex-col items-center justify-center text-center">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            fetchLocation();
          }}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-200">
      <div className="w-full shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 z-10 bg-indigo-400">
        <div className="text-2xl font-bold text-blue-800">Sapna</div>
        <button
          onClick={() => navigate("/trips")}
          className="text-white font-medium bg-blue-700 px-4 py-1 rounded hover:bg-white hover:text-blue-700 transition"
        >
          Back to Trips
        </button>
      </div>

      <motion.div
        className="p-6 pt-24 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Location for Trip #{tripId}
        </h2>

        {!location ? (
          <p>Detecting your location...</p>
        ) : (
          <>
            <div className="rounded overflow-hidden shadow-md mb-6">
              <MapContainer
                center={[location.latitude, location.longitude]}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: "400px", width: "100%" }}
                ref={mapRef}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />
                
                {/* Current Location Marker */}
                <Marker 
                  position={[location.latitude, location.longitude]}
                  icon={currentLocationIcon}
                >
                  <Popup>
                    <strong>Your Current Location</strong>
                    <p>Lat: {location.latitude.toFixed(6)}</p>
                    <p>Lng: {location.longitude.toFixed(6)}</p>
                  </Popup>
                </Marker>

                {/* Marked Location */}
                {markedLocation && (
                  <Marker 
                    position={[markedLocation.latitude, markedLocation.longitude]}
                    icon={markedLocationIcon}
                  >
                    <Popup>
                      <strong>Marked Location</strong>
                      <p>Lat: {markedLocation.latitude.toFixed(6)}</p>
                      <p>Lng: {markedLocation.longitude.toFixed(6)}</p>
                      {distance && (
                        <p className="mt-2 font-semibold">
                          Distance: {distance} km
                        </p>
                      )}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <p className="text-gray-600 mb-4">
                {isMarking 
                  ? "Click on the map to mark your desired location"
                  : "Click the 'Mark Location' button to start marking a location on the map"}
              </p>
              <div className="flex gap-4">
                <motion.button
                  onClick={startMarking}
                  className={`px-4 py-2 rounded text-white ${
                    isMarking 
                      ? 'bg-yellow-500 hover:bg-yellow-600' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isMarking ? 'Click on Map to Mark' : 'Mark Location'}
                </motion.button>
                {markedLocation && (
                  <motion.button
                    onClick={clearMarkedLocation}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear Marked Location
                  </motion.button>
                )}
              </div>
            </div>

            {markedLocation && distance && (
              <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-2">Distance Information</h3>
                <p className="text-gray-600">
                  You are {distance} kilometers away from the marked location.
                </p>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default LocationSharing;
