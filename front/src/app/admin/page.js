"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../lib/axios";
import "./admin.css";

export default function AdminLogin() {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      const response = await axiosInstance.post("/login", {
        email: loginForm.email,
        password: loginForm.password,
      });

      //Check if the user is an admin through isSuper property
      if (response.data.isSuper) {
        router.push("/admin/dashboard");
      } else {
        setError("You are not authorized.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
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
