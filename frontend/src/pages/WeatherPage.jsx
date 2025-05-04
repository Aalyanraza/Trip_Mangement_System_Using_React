import { useState } from "react";
import axios from "axios";

const WEATHER_API_KEY = "257389188c654dd398871416250405";

function WeatherPage() {
  const [location, setLocation] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!location.trim()) return;

    try {
      const res = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${location}&days=1&aqi=yes&alerts=no`
      );
      setWeather(res.data);
      setError("");
    } catch (err) {
      setWeather(null);
      setError("Could not fetch weather data. Please check the location.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-300 to-indigo-300 p-6">
        <div className="w-full shadow-md py-4 px-6 flex justify-between items-center fixed top-0 left-0 z-10 bg-sky-400">
        <div className="text-2xl font-bold text-indigo-600">Sapna</div>
      </div>
      <div className="max-w-2xl mx-auto space-y-6 pt-24">
        <h1 className="text-3xl font-bold text-center">Check Weather Info</h1>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Search
          </button>
        </div>

        {error && <p className="text-red-600">{error}</p>}

        {weather && (
          <div className="bg-sky-300 rounded shadow p-4 space-y-4">
            <h2 className="text-xl font-semibold">
              {weather.location.name}, {weather.location.region},{" "}
              {weather.location.country}
            </h2>
            <p className="text-lg">
              Current: {weather.current.temp_c}°C, {weather.current.condition.text}
            </p>
            <img
              src={weather.current.condition.icon}
              alt={weather.current.condition.text}
              className="w-16 h-16"
            />
            <p>Feels like: {weather.current.feelslike_c}°C</p>
            <p>Humidity: {weather.current.humidity}%</p>
            <p>Wind: {weather.current.wind_kph} km/h ({weather.current.wind_dir})</p>
            <p>UV Index: {weather.current.uv}</p>
            <p>Air Quality (PM2.5): {weather.current.air_quality.pm2_5.toFixed(2)}</p>

            <div>
              <h3 className="text-lg font-semibold mt-4">Hourly Forecast:</h3>
              <div className="overflow-x-auto flex space-x-4 mt-2">
                {weather.forecast.forecastday[0].hour.map((hr, i) => (
                  <div
                    key={i}
                    className="bg-blue-100 text-center p-2 rounded w-24 flex-shrink-0"
                  >
                    <p className="text-sm">{hr.time.split(" ")[1]}</p>
                    <img
                      src={hr.condition.icon}
                      alt={hr.condition.text}
                      className="mx-auto w-8 h-8"
                    />
                    <p>{hr.temp_c}°C</p>
                    <p className="text-xs">{hr.condition.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherPage;
