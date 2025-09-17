import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0NDljYjQ1NjdhYjQwNjhhOGVhMTEwMzUyY2E5ZDdhIiwiaCI6Im11cm11cjY0In0=";

const Home = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceSuggestions, setSourceSuggestions] = useState([]);
  const [destSuggestions, setDestSuggestions] = useState([]);
  const [buses, setBuses] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  // ------------------- NEW: Autocomplete -------------------
  const fetchSuggestions = async (query, setter) => {
    if (!query) {
      setter([]);
      return;
    }
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${API_KEY}&text=${encodeURIComponent(
          query
        )}&boundary.country=IN`
      );
      const data = await res.json();
      if (data.features) {
        setter(data.features);
      }
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };
  // ---------------------------------------------------------

  // ---------------- Existing mock bus data -----------------
  const busData = [
    { id: 1, name: "Global Express", source: "New York", destination: "Boston", time: "08:00 AM", seats: 30, distance: "340 km", duration: "4h 30m" },
    { id: 2, name: "Euro Travels", source: "Paris", destination: "Berlin", time: "09:30 AM", seats: 25, distance: "1050 km", duration: "11h 15m" },
    { id: 3, name: "Asia Connect", source: "Tokyo", destination: "Osaka", time: "07:45 AM", seats: 20, distance: "515 km", duration: "6h 00m" },
    { id: 4, name: "Desert Rider", source: "Dubai", destination: "Abu Dhabi", time: "06:15 AM", seats: 18, distance: "140 km", duration: "2h 15m" },
    { id: 5, name: "Indian Express", source: "Chennai", destination: "Bangalore", time: "10:00 AM", seats: 40, distance: "345 km", duration: "6h 30m" },
  ];
  // ---------------------------------------------------------

  // ---------------- Existing route fetch logic (unchanged) ----------------
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const geocodeORS = async (place, size = 3) => {
    try {
      const url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(
        place
      )}&size=${size}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.features) return [];
      return data.features.map((f) => ({
        coords: f.geometry.coordinates,
        label: f.properties?.label || place,
      }));
    } catch {
      return [];
    }
  };

  const geocodeNominatim = async (place, limit = 3) => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        place
      )}&format=json&limit=${limit}`;
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((d) => ({
        coords: [parseFloat(d.lon), parseFloat(d.lat)],
        label: d.display_name || place,
      }));
    } catch {
      return [];
    }
  };

  const getCandidates = async (place) => {
    let orsCandidates = await geocodeORS(place, 3);
    if (orsCandidates.length > 0) return orsCandidates;
    return await geocodeNominatim(place, 3);
  };

  const chooseBestPair = (srcCandidates, destCandidates) => {
    if (!srcCandidates || !destCandidates) return null;
    let best = { dist: Infinity, src: null, dest: null };
    for (const s of srcCandidates) {
      for (const d of destCandidates) {
        const km = haversineKm(s.coords[1], s.coords[0], d.coords[1], d.coords[0]);
        if (km < best.dist) best = { dist: km, src: s, dest: d };
      }
    }
    return best.src && best.dest ? best : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !destination) {
      alert("Please enter both source and destination.");
      return;
    }

    const results = busData.filter(
      (bus) =>
        bus.source.toLowerCase() === source.toLowerCase() &&
        bus.destination.toLowerCase() === destination.toLowerCase()
    );
    if (results.length > 0) {
      setBuses(results);
      setSearched(true);
      return;
    }

    try {
      const [srcCandidates, destCandidates] = await Promise.all([
        getCandidates(source),
        getCandidates(destination),
      ]);

      if (!srcCandidates.length || !destCandidates.length) {
        alert("Could not geocode one of the locations.");
        return;
      }

      const best = chooseBestPair(srcCandidates, destCandidates);
      if (!best) {
        alert("Could not pick matching locations.");
        return;
      }

      const start = best.src.coords;
      const end = best.dest.coords;
      const dirUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}&geometry_format=geojson`;
      const dirRes = await fetch(dirUrl);
      if (!dirRes.ok) return;

      const dirData = await dirRes.json();
      const seg = dirData.features[0]?.properties?.segments?.[0];
      if (seg) {
        const km = (seg.distance / 1000).toFixed(1);
        const hrs = Math.floor(seg.duration / 3600);
        const mins = Math.floor((seg.duration % 3600) / 60);
        const routeCoords = dirData.features[0].geometry.coordinates.map(
          (c) => [c[1], c[0]]
        );

        const fallback = [
          {
            id: 0,
            name: "No Direct Bus Available",
            source,
            destination,
            time: "N/A",
            seats: "N/A",
            distance: `${km} km`,
            duration: `${hrs}h ${mins}m`,
            route: routeCoords,
          },
        ];
        setBuses(fallback);
        setSearched(true);
      }
    } catch (err) {
      console.error("Route fetch error:", err);
    }
  };
  // ------------------------------------------------------------------------

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🚌 Bus Tracking App</h1>
        <p>Track your bus in real-time with ease</p>
      </header>

      {/* Search Form with Autocomplete */}
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group" style={{ position: "relative" }}>
          <label>Source</label>
          <input
            type="text"
            placeholder="Enter starting point"
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              fetchSuggestions(e.target.value, setSourceSuggestions);
            }}
          />
          {sourceSuggestions.length > 0 && (
            <ul className="suggestions">
              {sourceSuggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setSource(s.properties.label);
                    setSourceSuggestions([]);
                  }}
                >
                  {s.properties.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-group" style={{ position: "relative" }}>
          <label>Destination</label>
          <input
            type="text"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              fetchSuggestions(e.target.value, setDestSuggestions);
            }}
          />
          {destSuggestions.length > 0 && (
            <ul className="suggestions">
              {destSuggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setDestination(s.properties.label);
                    setDestSuggestions([]);
                  }}
                >
                  {s.properties.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="search-btn">
          Find Bus
        </button>
      </form>

      {/* Results Section (unchanged) */}
      {searched && (
        <section className="results">
          <h2>Available Buses</h2>
          <ul>
            {buses.map((bus) => (
              <li key={bus.id} className="bus-card">
                <h3>{bus.name}</h3>
                <p>
                  <strong>From:</strong> {bus.source} →{" "}
                  <strong>To:</strong> {bus.destination}
                </p>
                <p>
                  <strong>Departure:</strong> {bus.time}</p>
                <p><strong>Distance:</strong> {bus.distance}</p>
                <p><strong>Duration:</strong> {bus.duration}</p>
                {bus.route && (
                  <button
                    className="map-btn"
                    onClick={() =>
                      navigate("/map", {
                        state: { route: bus.route, source: bus.source, destination: bus.destination },
                      })
                    }
                  >
                    View on Map
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Feature Cards (unchanged) */}
      <section className="home-content">
        <div className="card">
          <h2>Live Bus Status</h2>
          <p>Check the current location and arrival time of your bus.</p>
          <button onClick={() => navigate("/track")}>Track Now</button>
        </div>

        <div className="card">
          <h2>Routes & Stops</h2>
          <p>Explore available bus routes and nearby bus stops.</p>
          <button onClick={() => navigate("/routes")}>View Routes</button>
        </div>
      </section>
    </div>
  );
};

export default Home;