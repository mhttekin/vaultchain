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
          <div className="flex flex-col justify-center gap-5 w-full mt-15">
            {transactions.map((txn) => (
              <div className="flex flex-row w-full gap-3 items-center" key={txn.id}>
                <div className="w-7 h-7 flex items-center">
                  <img src={`/assets/${fileMap[txn.coin_symbol]}.png`} className="w-7 h-7"/>
                </div>
                <div className="w-20 h-7 flex items-center">
                  <h1 className="font-bold text-sm">{messageMap[txn.transaction_type]}</h1> 
                  <h1></h1>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
