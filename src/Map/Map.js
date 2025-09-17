import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Polyline, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Map = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { route, source, destination } = location.state || {};

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      {/* ✅ Map Container */}
      {route ? (
        <MapContainer
          center={route.length > 0 ? route[0] : [11, 78]}
          zoom={7}
          style={{ height: "90%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ Draw route polyline */}
          <Polyline positions={route} color="blue" />

          {/* ✅ Start marker */}
          <Marker position={route[0]}>
            <Popup>Start: {source}</Popup>
          </Marker>

          {/* ✅ End marker */}
          <Marker position={route[route.length - 1]}>
            <Popup>Destination: {destination}</Popup>
          </Marker>
        </MapContainer>
      ) : (
        <p style={{ textAlign: "center", padding: "20px" }}>
          No route available.
        </p>
      )}

      {/* ✅ Back Button */}
      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ⬅ Back to Home
        </button>
      </div>
    </div>
  );
};

export default Map;
