import React, { useState } from "react";
import "./Routes.css";

const Routes = () => {
  const [showRoutes, setShowRoutes] = useState(false);

  // Example predefined routes with stops
  const routesData = [
    {
      id: 1,
      name: "Route 1: Chennai → Coimbatore",
      stops: ["Chennai", "Vellore", "Salem", "Erode", "Coimbatore"],
    },
    {
      id: 2,
      name: "Route 2: Coimbatore → Bangalore",
      stops: ["Coimbatore", "Salem", "Hosur", "Bangalore"],
    },
    {
      id: 3,
      name: "Route 3: Delhi → Jaipur",
      stops: ["Delhi", "Gurgaon", "Rewari", "Alwar", "Jaipur"],
    },
  ];

  return (
    <div className="routes-container">
      <div className="routes-card">
        <h2>Routes & Stops</h2>
        <p>Explore available bus routes and nearby bus stops.</p>
        <button onClick={() => setShowRoutes(!showRoutes)}>
          {showRoutes ? "Hide Routes" : "View Routes"}
        </button>
      </div>

      {showRoutes && (
        <section className="routes-list">
          <h2>Available Routes 🚍</h2>
          <ul>
            {routesData.map((route) => (
              <li key={route.id} className="route-card">
                <h3>{route.name}</h3>
                <p>
                  <strong>Stops:</strong> {route.stops.join(" → ")}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default Routes;
