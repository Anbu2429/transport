import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import Home from "./Home/Home";
import Login from "./Login/Login";
import Register from "./Login/Register";
import Map  from "./Map/Map"; // ✅ Make sure MapPage is inside /Map folder
import "./App.css";

// ✅ Wrapper to handle Navbar visibility
function AppWrapper() {
  const location = useLocation();

  // Hide navbar on login, register, and default root
  const hideNavbar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div>
      {/* Navbar (hidden on Login/Register) */}
      {!hideNavbar && (
        <nav className="navbar">
          <h2 className="logo">Smart Bus Tracker</h2>
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/login">Logout</Link>
            </li>
          </ul>
        </nav>
      )}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Login />} /> {/* Default: Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/map" element={<Map />} /> {/* ✅ Map */}
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
