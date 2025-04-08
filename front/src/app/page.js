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
  const [networks, setNetworks] = useState(null);
  const [mainLoading, setMainLoading] = useState(true);
  const [selectedNetworks, setSelectedNetworks] = useState([]);
  const [displayNetworks, setDisplayNetworks] = useState("All Networks");

  const [walletBalances, setWalletBalances] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0.0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const settingsRef = useRef(null);
  const settingsBarRef = useRef(null);
  const filterButtonRef = useRef(null); 
  const filterDropdownRef = useRef(null);


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
          const chains = [];
          for (const wallet of wallets) {
            if (!chains.includes(wallet.chain.name)){
              chains.push(wallet.chain.name);
            }
            const response = await axiosInstance.get(
              `/api/wallets/${wallet.id}/balances/`
            );
            balances.push(response.data[0]);
          }
          setWalletBalances(balances);
          setNetworks(chains);
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target) 
      && settingsBarRef.current && !settingsBarRef.current.contains(event.target)){
        setSettingsOpen(false);
      }
      if (filterButtonRef.current && !filterButtonRef.current.contains(event.target)
        && filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)){
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  const handleLogout = async () => {
    const response = await logout();
    if (!response.success) {
      setError(response.error);
    }
  };

  const toggleNetwork = (network) => {
    setSelectedNetworks(prev => {
      if(!network){
        return [];
      } else if (prev.includes(network)) {
        return prev.filter(n => n !== network);
      } else {
        return [...prev, network];
      }
    });
  };

  const getFilteredBalances = () => {
    if (!walletBalances) return [];
    if (selectedNetworks.length === 0) {
      return walletBalances;
    }
    return walletBalances.filter((balance) =>
      selectedNetworks.includes(balance.coin.chain.name)
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
  <div className="w-full h-full overflow-hidden">
    <div className="h-[100vh]  relative flex flex-col">
      {filterOpen && (
        <div className="absolute w-full h-full z-1 bg-black/30">
        </div>
      )}
      <div className="flex flex-row justify-between items-start mt-14 mx-[1.75rem]">
        <div className="w-auto flex flex-col justify-start">
          <span
          className="text-lg">Welcome</span>
          <span className="text-2xl">{user.first_name} {user.last_name}</span>
        </div>
        <div className="relative">
        <button
        ref={settingsRef}
        onClick={() => setSettingsOpen(prev => !prev)}>
          Settings 
        </button>
        {settingsOpen && (
          <div
          ref={settingsBarRef}
          className="absolute top-8 -left-2 flex flex-col gap-2 bg-[#252525] 
          border w-[5.1rem] h-20 p-1 py-2 rounded-lg border-white justify-center">
            <Link href="/profile" className="border-b border-b-gray-700/50 pb-2">
            Profile</Link>
            <button onClick={handleLogout} className="text-left">Log out</button> 
          </div>
        )}
        </div> 
      </div>
      <nav className="absolute bottom-5 border-t border-t-gray-700 
    w-full flex justify-between px-[1.75rem] pt-2 self-center items-center
    content-center">
        <Link href="/">Home</Link>
        <Link href="/transactions">Trans</Link>
        <Link href="/transactionhistory">TH</Link>
        <Link href="/wallet">Wallet</Link>
      </nav>

      {/* Wallet Items */}
      <div className="w-full flex mt-20 border-b border-gray-700 pb-2 px-[1.75rem]">
        <h2 className="text-3xl font-bold">${formatBalance(totalBalance)}</h2>
      </div>
      <div className="flex w-full px-[1.75rem] flex-col">
        <div className="flex flex-col items-start my-5">
          <button 
          ref={filterButtonRef}
          className="py-1 px-3 bg-[#353535] rounded-2xl text-left"
          onClick={() => setFilterOpen(prev => !prev)}>
          {`${selectedNetworks.length > 0 ? `Networks(${selectedNetworks.length})`
          : 'All networks'}`} 
          </button>
          {filterOpen && networks && (
            <div
            ref={filterDropdownRef}
            className="absolute w-full flex flex-col bg-[#252525]
            left-0 bottom-0 z-10 px-[1.75rem] h-72 items-start
            justify-center gap-2 rounded-t-xl shadow border-t-2 border-gray-600/50">
              <button onClick={() => toggleNetwork('')}
              className={`w-full flex py-1 px-3 rounded-sm ${
                selectedNetworks.length === 0 ? 'bg-[#151515]' : ''
              }`}>All networks</button>
              {networks.map(chain => (
                <button key={chain}
                className={`w-full flex py-1 px-3 ${
                selectedNetworks.includes(chain) ? 'bg-[#151515]' : ''
              }`}
                onClick={() => toggleNetwork(chain)}>
                {chain}
                </button>
              ))}
              <button 
              onClick={() => setFilterOpen(false)}
              className="w-full flex justify-center rounded-2xl py-3 p-2
              bg-[#353535] mt-5">Done</button>
            </div>
          )}
        </div>
        <div className="flex content-center flex-col justify-center self-center
        pb-20 relative w-full mt-10">
          <div className="flex w-full">
            {walletBalances && (
              <div className="flex flex-col gap-8 w-full">
                {getFilteredBalances().length > 0 ? (
                  getFilteredBalances().map((balance) => (
                    <div key={balance.id} className="flex flex-row w-full gap-2
                    items-center">
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
                        className="w-10 h-10"
                      />
                      <div className="w-full flex flex-row items-center justify-between">
                        <span className="pl-1 coin-name">{balance.coin.name}</span>
                        <div className="flex flex-col w-full items-end">
                          <span className="text-[1rem]">
                          ${isNaN(balance.amount * balance.coin.price) ? "0.00" : formatBalance(balance.amount * balance.coin.price)}
                          </span>
                          <span className="text-gray-400 text-sm">
                            {balance.amount} {balance.coin.symbol}
                          </span>

                        </div>
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
  </div>
);
}
