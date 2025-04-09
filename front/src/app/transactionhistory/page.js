"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import styles from "./transactionHistory.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";


export default function TransactionHistory() {
  const router = useRouter();
  const { user, loading : userLoading } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !loading){
      router.push('/login');
    }
  }, [user, loading, router]);

  const formatAddress = (address) => {
    if (address && address.length > 20) {
      return `${address.slice(0, 5)}...${address.slice(-4)}`; 
    }
    return address;
  };

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
  if (!user) return null;
  if (loading || userLoading) return <p className={styles.loading}>Loading...</p>;
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
                  <strong>Sender:</strong> {formatAddress(txn.wallet_public_key) || "N/A"}
                </div>
                <div>
                  <strong>Receiver:</strong> {formatAddress(txn.counterparty_public_key) || "N/A"}
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
