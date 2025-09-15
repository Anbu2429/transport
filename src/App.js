import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ORS API Key
const API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0NDljYjQ1NjdhYjQwNjhhOGVhMTEwMzUyY2E5ZDdhIiwiaCI6Im11cm11cjY0In0=";

// Sample bus schedule dataset
const busData = [
  {
    bus_no: "7E",
    route: ["Gandhipuram", "Town Hall", "Ukkadam", "Kovaipudur"],
    start_time: "06:00",
    end_time: "22:00",
    frequency_min: 15,
  },
  {
    bus_no: "70",
    route: ["Gandhipuram", "Ramanathapuram", "Podanur", "Kovaipudur"],
    start_time: "05:30",
    end_time: "21:30",
    frequency_min: 20,
  },
  {
    bus_no: "23C",
    route: ["Ukkadam", "Selvapuram", "Perur", "Kovaipudur"],
    start_time: "06:15",
    end_time: "21:45",
    frequency_min: 25,
  },
];

function App() {
  const [source, setSource] = useState("Gandhipuram, Coimbatore");
  const [destination, setDestination] = useState("Kovaipudur, Coimbatore");
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableBuses, setAvailableBuses] = useState([]);

  // Geocode place → lat/lng
  const geocode = async (place) => {
    const resp = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(
        place
      )}`
    );
    const data = await resp.json();
    if (!data.features || data.features.length === 0) {
      throw new Error("Location not found: " + place);
    }
    const [lng, lat] = data.features[0].geometry.coordinates;
    return [lng, lat];
  };

  // Fetch route from ORS
  const fetchRoute = async (src, dest) => {
    setLoading(true);
    try {
      const start = await geocode(src);
      const end = await geocode(dest);

      const body = {
        coordinates: [start, end],
      };

      const response = await fetch(
        "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: API_KEY,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(err);
      }

      const data = await response.json();
      console.log("Route Data:", data);

      if (!data.features || data.features.length === 0) {
        throw new Error("No route found");
      }

      const routeCoords = data.features[0].geometry.coordinates.map((c) => [
        c[1],
        c[0],
      ]);

      setRoute({
        coords: routeCoords,
        distance: (data.features[0].properties.summary.distance / 1000).toFixed(
          1
        ),
        duration: Math.round(
          data.features[0].properties.summary.duration / 60
        ),
      });

      // Filter buses that match src → dest
      const buses = busData.filter((bus) => {
        const sIndex = bus.route.indexOf(src.split(",")[0]); // match first word
        const dIndex = bus.route.indexOf(dest.split(",")[0]);
        return sIndex !== -1 && dIndex !== -1 && sIndex < dIndex;
      });

      setAvailableBuses(buses);
    } catch (err) {
      console.error(err);
      alert("Error fetching route:\n" + err.message);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchRoute(source, destination);
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: "320px", padding: "10px", background: "#f8f9fa" }}>
        <h2>🚌 Coimbatore Routes</h2>
        <form onSubmit={handleSubmit}>
          <label>Source:</label>
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <label>Destination:</label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            style={{ width: "100%", marginBottom: "10px" }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Find Route"}
          </button>
        </form>

        {route && (
          <div style={{ marginTop: "15px" }}>
            <h3>🛣️ Route Info</h3>
            <p>Distance: {route.distance} km</p>
            <p>Duration: {route.duration} min</p>
          </div>
        )}

        {availableBuses.length > 0 && (
          <div style={{ marginTop: "15px" }}>
            <h3>🚍 Bus Schedules</h3>
            {availableBuses.map((bus) => (
              <div
                key={bus.bus_no}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "5px",
                  padding: "8px",
                  marginBottom: "8px",
                  background: "#fff",
                }}
              >
                <p>
                  <strong>Bus No:</strong> {bus.bus_no}
                </p>
                <p>
                  <strong>Route:</strong> {bus.route.join(" → ")}
                </p>
                <p>
                  <strong>Schedule:</strong> {bus.start_time} – {bus.end_time}
                </p>
                <p>
                  <strong>Frequency:</strong> every {bus.frequency_min} mins
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[11.0168, 76.9558]} // Coimbatore
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {route && (
            <>
              <Polyline positions={route.coords} pathOptions={{ color: "blue" }} />
              <Marker position={route.coords[0]}>
                <Popup>Start: {source}</Popup>
              </Marker>
              <Marker position={route.coords.slice(-1)[0]}>
                <Popup>End: {destination}</Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}

export default App;
