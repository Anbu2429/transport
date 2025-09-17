import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
  Navigate,
} from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Login/Register";
import Map from "./Map/Map";
import RoutesPage from "./Routes/Routes";
import Track from "./Track/Track";
import "./App.css";

// ✅ Wrapper for conditional Navbar + Protected Routes
function AppWrapper() {
  const location = useLocation();
  const isLoggedIn = !!localStorage.getItem("user");

  // Hide navbar on login and register pages
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div>
      {/* Navbar (only if logged in and not on login/register) */}
      {!hideNavbar && isLoggedIn && (
        <nav className="navbar">
          <h2 className="logo">Smart Bus Tracker</h2>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li
              onClick={() => {
                localStorage.removeItem("user");
                window.location.href = "/login";
              }}
            >
              Logout
            </li>
          </ul>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        {/* Default route → Home */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<Track />} />
        {/* Protected Routes */}
        <Route
          path="/map"
          element={isLoggedIn ? <Map /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/routes"
          element={isLoggedIn ? <RoutesPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
