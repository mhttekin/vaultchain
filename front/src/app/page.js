"use client";

import axiosInstance from "../lib/axios";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Import Link for navigation
import "./mainpage.css";



export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [wallets, setWallets] = useState(null);
  const [mainLoading, setMainLoading] = useState(true);
  const [openNetwork, setOpenNetwork] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState([]);
  const [displayNetworks, setDisplayNetworks] = useState("All Networks");

  const [walletBalances, setWalletBalances] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0.0);

  const dropdownRef = useRef(null);


  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading) {
      const fetchWallets = async () => {
        try {
          const response = await axiosInstance.get("/api/wallets/");
          setWallets(response.data);
        } catch (error) {
          setError(error);
        }
      };
      fetchWallets();
    }
  }, [user, loading]);

  useEffect(() => {
    if (user && wallets && wallets.length > 0) {
      setMainLoading(true);
      const fetchBalances = async () => {
        try {
          const balances = [];
          for (const wallet of wallets) {
            const response = await axiosInstance.get(
              `/api/wallets/${wallet.id}/balances/`
            );
            balances.push(response.data[0]);
          }
          setWalletBalances(balances);
        } catch (error) {
          setError(error);
          console.error(error);
        } finally {
          setMainLoading(false);
        }
      };
      fetchBalances();
    }
  }, [user, wallets]);

  useEffect(() => {
    if (user && walletBalances && walletBalances.length > 0) {
      setMainLoading(true);
      let amount = 0.0;
      walletBalances.forEach((balance) => {
        amount += Number(balance.amount);
      });
      setTotalBalance(amount);
      setMainLoading(false);
    }
  }, [user, walletBalances]);

  const handleLogout = async () => {
    const response = await logout();
    if (!response.success) {
      setError(response.error);
    }
  };

  const getFilteredBalances = () => {
    if (!walletBalances) return [];
    if (selectedNetworks.length === 0) {
      return walletBalances;
    }
    return walletBalances.filter((balance) =>
      selectedNetworks.includes(balance.coin.chain.symbol)
    );
  };

  const formatBalance = (balance) => {
    return Number(balance).toFixed(2);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
  <div className="main-container">
    <div className="grid-container">
      {/* Navigation Bar */}
      <nav className="navbar grid-item nav">
        <Link href="/">Home</Link>
        {user ? (
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        ) : (
          <Link href="/login">Login</Link>
        )}
      </nav>

      {/* Wallet Items */}
      <div className="wallet-items grid-item wallets">
        <h1>
          Welcome {user.first_name} {user.last_name}
        </h1>
        <h2>Current Balance: {formatBalance(totalBalance)}</h2>
        <div className="wallet-balances">
          {walletBalances && (
            <div>
              {getFilteredBalances().length > 0 ? (
                getFilteredBalances().map((balance) => (
                  <div key={balance.id} className="wallet-item">
                    <img
                      src={
                        balance.coin.symbol.toLowerCase() === "btc"
                          ? "/assets/bitcoin.png"
                          : balance.coin.symbol.toLowerCase() === "eth"
                          ? "/assets/ethereum.png"
                          : balance.coin.symbol.toLowerCase() === "sol"
                          ? "/assets/solana.png"
                          : "/assets/default.png" // Fallback for unknown coins
                      }
                      alt={balance.coin.name}
                      className="coin-icon"
                    />
                    <div className="coin-details">
                      <span className="coin-name">{balance.coin.name}</span>
                      <span className="coin-amount">
                        {balance.amount} {balance.coin.symbol}
                      </span>
                      <span className="coin-value">
                      ${isNaN(balance.amount * balance.coin.price) ? "0.00" : formatBalance(balance.amount * balance.coin.price)}
                        </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-balances">
                  No balances to display for selected networks
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}
