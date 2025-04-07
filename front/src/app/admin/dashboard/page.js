"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "../../lib/axios";
import "./dashboard.css";

export default function AdminDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAdminAuthorization = async () => {
      try {
        // Make a request to verify if the user is an admin
        const response = await axiosInstance.get("/auth/check-admin");
        if (!response.data.isSuper) {
          throw new Error("You are not authorized.");
        }
        setIsLoading(false); // Admin is authorized
      } catch (err) {
        setError(err.message || "Authorization failed.");
        router.push("/admin"); // Redirect to admin login if not authorized
      }
    };

    checkAdminAuthorization();
  }, [router]);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Here you can manage users, view reports, and perform admin-specific tasks.</p>
      {/* Add admin-specific functionality here */}
    </div>
  );
}