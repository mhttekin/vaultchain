"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  // Mock authentication check
  useEffect(() => {
    const isAdminAuthenticated = true; // Replace with real authentication logic
    if (!isAdminAuthenticated) {
      router.push("/admin"); // Redirect to admin login if not authenticated
    }
  }, [router]);

  return (
    <div className="admin-dashboard-container">
      <h1>Welcome to the Admin Dashboard</h1>
      <p>Here you can manage users, view reports, and perform admin-specific tasks.</p>
    </div>
  );
}