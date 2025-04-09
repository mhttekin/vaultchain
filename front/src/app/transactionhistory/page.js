"use client";
import React, { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";


export default function TransactionHistory() {
  const router = useRouter();
  const { wallets, marketData } = useWallet();
  const { user, loading : userLoading } = useAuth(); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fileMap = {
    BTC: "bitcoin",
    ETH: "ethereum",
    SOL: "solana",
  };
  const messageMap = {
    deposit: "Deposited",
    withdrawal: "Withdrawn",
  };

  const formatNumber = (value, mode) => {
    const number = Number(value);
    if (isNaN(number)) return "0.00";

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: mode ? 2 : 7,
    });
  };



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
    axiosInstance
      .get("http://127.0.0.1:8000/api/transactions/")
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
  if (loading || userLoading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="w-full h-[100vh] flex flex-col overflow-x-hidden">
      <div className="w-full flex flex-col px-5">
        <h2 className="font-bold text-3xl mt-15">Transactions</h2>

        {transactions.length === 0 ? (
          <p className="flex w-full h-full justify-center self-center">No transactions found.</p>
        ) : (
          <div className="flex flex-col justify-center gap-3 w-full mt-15">
            {transactions.map((txn) => (
              <div className="flex flex-row h-15 w-full gap-3 items-center" key={txn.id}>
                <div className="w-7 h-full flex">
                  <img src={`/assets/${fileMap[txn.coin_symbol]}.png`} className="w-7 h-7"/>
                </div>
                <div className="w-40 flex-2 h-full flex flex-col items-start">
                  <h1 className="font-bold text-sm">
                    {txn.transaction_type === "transfer"
                      ? wallets.some(wallet => wallet.public_key === txn.wallet_public_key)
                        ? "Sent"
                        : "Received"
                      : messageMap[txn.transaction_type]}
                  </h1> 
                  {wallets && txn.transaction_type === 'transfer' && (
                    <h1 className="text-left text-gray-500 text-sm">  {wallets.some(wallet => wallet.public_key === txn.wallet_public_key)
                    ? `To: ${formatAddress(txn.counterparty_public_key)}`
                    : `From: ${formatAddress(txn.wallet_public_key)}`}
                    </h1>
                  )}
                </div>
                <div className="flex flex-1 h-full flex-col items-end">
                  <h1 className="text-sm">${formatNumber(txn.amount * marketData[txn.coin_symbol].price, true)}</h1>
                  <h1 className="text-xs text-gray-500">{formatNumber(txn.amount, false)}
                    {'\u00A0'}{txn.coin_symbol}
                  </h1>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
