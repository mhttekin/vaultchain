"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./admin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Hardcoded admin credentials
  const adminCredentials = {
    email: "admin@example.com",
    password: "admin123",
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Check if the entered credentials match the hardcoded admin credentials
    if (
      loginForm.email === adminCredentials.email &&
      loginForm.password === adminCredentials.password
    ) {
      router.push("/admin/dashboard"); // Redirect to admin dashboard
    } else {
      setError("Invalid admin credentials");
    }

    setIsLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h1>Admin Login</h1>
        <form onSubmit={handleLoginSubmit} className="admin-login-form">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={loginForm.email}
            onChange={handleLoginChange}
            required
          />
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={loginForm.password}
            onChange={handleLoginChange}
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}