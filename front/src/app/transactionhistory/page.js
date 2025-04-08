"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./transactionHistory.module.css";
import Link from "next/link";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setError("Please login to view your transactions.");
      setLoading(false);
      return;
    }

    axios
      .get("http://127.0.0.1:8000/api/transactions/", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTransactions(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to fetch transactions.");
        setLoading(false);
      });
  }, []);

  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.historyPanel}>
        <h2 className={styles.title}>Transaction History</h2>

        {transactions.length === 0 ? (
          <p className={styles.noTransactions}>No transactions found.</p>
        ) : (
          <div className={styles.transactionList}>
            {transactions.map((txn) => (
              <div className={styles.transactionCard} key={txn.id}>
                <div>
                  <strong>ID:</strong> {txn.id}
                </div>
                <div>
                  <strong>Type:</strong> {txn.transaction_type}
                </div>
                <div>
                  <strong>Amount:</strong> {txn.amount} {txn.coin_symbol}
                </div>
                <div>
                  <strong>Sender:</strong> {txn.sender || "N/A"}
                </div>
                <div>
                  <strong>Receiver:</strong> {txn.receiver || "N/A"}
                </div>
                <div>
                  <strong>Status:</strong> {txn.status || "Completed"}
                </div>
                <div>
                  <strong>Date:</strong> {new Date(txn.timestamp).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
