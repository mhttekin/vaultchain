"use client";
import React, { useEffect, useState } from "react";
//import { useRouter } from "next/navigation";
//import axiosInstance from "../../../lib/axios";
import "./dashboard.css";

export default function AdminDashboard() {
  //const router   useRouter();
  //const [isLoading, setIsLoading] = useState(true);
  //const [error, setError] = useState("");


  // Hardcoded data
  const userWallets = [
    { id: 1, user: "John Doe", balance: "5.2 BTC" },
    { id: 2, user: "Jane Smith", balance: "12.4 ETH" },
    { id: 3, user: "Alice Johnson", balance: "3.1 SOL" },
  ];

  const helpRequests = [
    { id: 1, user: "John Doe", issue: "Unable to withdraw funds" },
    { id: 2, user: "Jane Smith", issue: "Account verification pending" },
    { id: 3, user: "Alice Johnson", issue: "Transaction failed" },
  ];

  const transactions = [
    { id: 1, user: "John Doe", amount: "0.5 BTC", status: "Completed" },
    { id: 2, user: "Jane Smith", amount: "1.2 ETH", status: "Pending" },
    { id: 3, user: "Alice Johnson", amount: "0.8 SOL", status: "Failed" },
  ];

  // useEffect(() => {
  //   const checkAdminAuthorization = async () => {
  //     try {
  //       // Make a request to verify if the user is an admin
  //       const response = await axiosInstance.get("/auth/check-admin");
  //       if (!response.data.isSuper) {
  //         throw new Error("You are not authorized.");
  //       }
  //       setIsLoading(false); // Admin is authorized
  //     } catch (err) {
  //       setError(err.message || "Authorization failed.");
  //       router.push("/admin"); // Redirect to admin login if not authorized
  //     }
  //   };

  //   checkAdminAuthorization();
  // }, [router]);

  // if (isLoading) {
  //   return <div className="loading">Loading...</div>;
  // }

  // if (error) {
  //   return <div className="error-message">{error}</div>;
  // }

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      {/* User Wallets Section */}
      <section className="dashboard-section">
        <h2>User Wallets</h2>
        <ul>
          {userWallets.map((wallet) => (
            <li key={wallet.id}>
              {wallet.user}: {wallet.balance}
            </li>
          ))}
        </ul>
      </section>

      {/* User Help Requests Section */}
      <section className="dashboard-section">
        <h2>User Help Requests</h2>
        <ul>
          {helpRequests.map((request) => (
            <li key={request.id}>
              {request.user}: {request.issue}
            </li>
          ))}
        </ul>
      </section>

      {/* Transactions Section */}
      <section className="dashboard-section">
        <h2>Transactions</h2>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.user}: {transaction.amount} - {transaction.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
