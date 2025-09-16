import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const Login = () => {
  const [loginInput, setLoginInput] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get stored user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
      storedUser &&
      (storedUser.email === loginInput || storedUser.phone === loginInput) &&
      storedUser.password === password
    ) {
      alert("Login successful!");
      navigate("/home"); // Redirect to Home
    } else {
      alert("Invalid email/phone or password. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2 className="login-title">Login</h2>

        <div className="input-group">
          <label>Email or Phone</label>
          <input
            type="text"
            placeholder="Enter your email or phone number"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">Login</button>

        <p className="new-user">
          New User? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
