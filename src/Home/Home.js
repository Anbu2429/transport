import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjA0NDljYjQ1NjdhYjQwNjhhOGVhMTEwMzUyY2E5ZDdhIiwiaCI6Im11cm11cjY0In0=";

const Home = () => {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [buses, setBuses] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  // Mock bus data
  const busData = [
    {
      id: 1,
      name: "Global Express",
      source: "New York",
      destination: "Boston",
      time: "08:00 AM",
      seats: 30,
      distance: "340 km",
      duration: "4h 30m",
    },
    {
      id: 2,
      name: "Euro Travels",
      source: "Paris",
      destination: "Berlin",
      time: "09:30 AM",
      seats: 25,
      distance: "1050 km",
      duration: "11h 15m",
    },
    {
      id: 3,
      name: "Asia Connect",
      source: "Tokyo",
      destination: "Osaka",
      time: "07:45 AM",
      seats: 20,
      distance: "515 km",
      duration: "6h 00m",
    },
    {
      id: 4,
      name: "Desert Rider",
      source: "Dubai",
      destination: "Abu Dhabi",
      time: "06:15 AM",
      seats: 18,
      distance: "140 km",
      duration: "2h 15m",
    },
    {
      id: 5,
      name: "Indian Express",
      source: "Chennai",
      destination: "Bangalore",
      time: "10:00 AM",
      seats: 40,
      distance: "345 km",
      duration: "6h 30m",
    },
  ];

  // ✅ Geocode location name into lat/lon
  const geocode = async (place) => {
    const res = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(
        place
      )}`
    );
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].geometry.coordinates; // [lon, lat]
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!source || !destination) {
      alert("Please enter both source and destination.");
      return;
    }

    // Try to match buses
    const results = busData.filter(
      (bus) =>
        bus.source.toLowerCase() === source.toLowerCase() &&
        bus.destination.toLowerCase() === destination.toLowerCase()
    );

    if (results.length > 0) {
      setBuses(results);
    } else {
      try {
        // ✅ If no bus found → fetch real route from ORS
        const startCoords = await geocode(source);
        const endCoords = await geocode(destination);

        if (!startCoords || !endCoords) {
          alert("Could not find one of the locations.");
          return;
        }

        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${startCoords[0]},${startCoords[1]}&end=${endCoords[0]},${endCoords[1]}`
        );
        const data = await res.json();

        if (data && data.features && data.features.length > 0) {
          const distanceKm = (
            data.features[0].properties.segments[0].distance / 1000
          ).toFixed(1);
          const durationMin = Math.round(
            data.features[0].properties.segments[0].duration / 60
          );

          const hours = Math.floor(durationMin / 60);
          const minutes = durationMin % 60;

          const fallback = [
            {
              id: 0,
              name: "No Direct Bus Available",
              source,
              destination,
              time: "N/A",
              seats: "N/A",
              distance: `${distanceKm} km`,
              duration: `${hours}h ${minutes}m`,
              route: data.features[0].geometry.coordinates.map((c) => [
                c[1],
                c[0],
              ]), // ✅ save route for map
            },
          ];
          setBuses(fallback);
        } else {
          alert("No route found.");
        }
      } catch (err) {
        console.error("Route fetch error:", err);
        alert("Something went wrong while fetching route data.");
      }
    }

    setSearched(true);
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>🚌 Bus Tracking App</h1>
        <p>Track your bus in real-time with ease</p>
      </header>

      {/* Search Form */}
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Source</label>
          <input
            type="text"
            placeholder="Enter starting point"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Destination</label>
          <input
            type="text"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <button type="submit" className="search-btn">
          Find Bus
        </button>
      </form>

      {/* Results Section */}
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
                  <strong>Departure:</strong> {bus.time}
                </p>
                <p>
                  <strong>Distance:</strong> {bus.distance}
                </p>
                <p>
                  <strong>Duration:</strong> {bus.duration}
                </p>
                <p>
                  <strong>Seats Available:</strong> {bus.seats}
                </p>

                {/* ✅ Show map button if route exists */}
                {bus.route && bus.route.length > 0 && (
                  <button
                    className="map-btn"
                    onClick={() =>
                      navigate("/map", {
                        state: {
                          route: bus.route,
                          source: bus.source,
                          destination: bus.destination,
                        },
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

      {/* Feature Cards */}
      <section className="home-content">
        <div className="card">
          <h2>Live Bus Status</h2>
          <p>Check the current location and arrival time of your bus.</p>
          <button>Track Now</button>
        </div>

        <div className="card">
          <h2>Routes & Stops</h2>
          <p>Explore available bus routes and nearby bus stops.</p>
          <button>View Routes</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
