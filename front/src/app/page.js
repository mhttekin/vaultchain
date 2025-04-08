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

  const [hideBalance, setHideBalance] = useState(true);
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
        className="bg-[#353535] cursor-pointer rounded-lg
    py-2 px-3 hover:bg-[#00ffcc] transition duration-300
    ease-in-out hover:text-black"

        onClick={() => setSettingsOpen(prev => !prev)}>
          Settings 
        </button>
        {settingsOpen && (
          <div
          ref={settingsBarRef}
          className="absolute top-10 left-0 flex flex-col gap-2 bg-[#252525] 
          border w-[5.1rem] h-20 p-1 py-2 rounded-lg border-white justify-center">
            <Link href="/profile" className="border-b border-b-gray-700/50 pb-2">
            Profile</Link>
            <button onClick={handleLogout} className="text-left">Log out</button> 
          </div>
        )}
        </div> 
      </div>

      {/* Wallet Items */}
      <div className="relative w-full flex flex-col items-center
      mt-[3rem] border-b border-gray-700 pb-10 px-[1.75rem]">
        <div className="flex flex-col justify-center items-center relative max-w-40">
          <div className={`min-w-40 max-w-80 h-10 text-4xl text-center duration-300 transition-all
            ${hideBalance ? 'bg-[rgba(180,235,255,0.7)] blur-xl rounded-lg' : ''}`}>{hideBalance ? '' : `$${formatBalance(totalBalance)}`}</div>
          <button className="flex self-start absolute top-12 left-0"
          onClick={() => setHideBalance(prev => !prev)}>
            h
          </button>
        </div>
        <div className="flex flex-row w-full gap-7 text-xs items-center justify-center mt-12 h-20">
          <button className="flex flex-col justify-center items-center gap-2">
            <div className="flex bg-blue-600 w-10 h-10 rounded-lg"
            style={{boxShadow: '0 0px 20px -3px oklch(88.2% 0.059 254.128)'}}></div>
            <span className="flex text-center">Receive</span>
          </button> 
          <button className="flex flex-col justify-center items-center gap-2">
            <div className="flex bg-blue-600 w-10 h-10 rounded-lg"
            style={{boxShadow: '0 0px 20px -3px oklch(88.2% 0.059 254.128)'}}></div>
            <span className="flex text-center">Send</span>
          </button> 
          <button className="flex flex-col items-center justify-center gap-2">
            <div className="flex bg-blue-600 w-10 h-10 rounded-lg"
            style={{boxShadow: '0 0px 20px -3px oklch(88.2% 0.059 254.128)'}}></div>
            <span className="flex text-center">Buy</span>
          </button> 
        </div>
        
      </div>
      <div className="flex w-full px-[1.75rem] flex-col">
        <div className="flex flex-col items-start mt-5 mb-2">
          <button 
          ref={filterButtonRef}
          className="py-1 px-3 bg-[#353535] rounded-2xl text-left
    hover:bg-[#00ffcc] transition duration-300 ease-in-out
    hover:text-black"
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
                selectedNetworks.length === 0 ? 'bg-[#151515] shadow-md inset-shadow' : ''
              }`}>All networks</button>
              {networks.map(chain => (
                <button key={chain}
                className={`w-full flex py-1 px-3 ${
                selectedNetworks.includes(chain) ? 
                    'bg-[#151515] shadow-md inset-shadow' : ''
              }`}
                onClick={() => toggleNetwork(chain)}>
                {chain}
                </button>
              ))}
              <button 
              onClick={() => setFilterOpen(false)}
              className="w-full flex justify-center rounded-2xl py-3 p-2
              bg-[#353535] mt-5 hover:bg-[#00ffcc] duration-300 ease-in-out hover:text-black shadow-md">Done</button>
            </div>
          )}
        </div>
        <div className="flex content-center flex-col justify-center self-center
        pb-20 relative w-full mt-10">
          <div className="flex w-full">
            {walletBalances && (
              <div className="flex flex-col gap-4 w-full">
                {getFilteredBalances().length > 0 ? (
                  getFilteredBalances().map((balance) => (
                    <div key={balance.id} className="flex flex-row w-full gap-2
                    items-center bg-[#252525] rounded-lg py-2 px-2 hover:bg-[#303030] transition-all
                    duration-300"
                    style={{boxShadow: '0px 0px 120px -22px oklch(54.6% 0.245 262.881)'}}>
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
                        className="w-8 h-8"
                      />
                      <div className="w-full flex flex-row items-center justify-between">
                        <span className="pl-1 coin-name">{balance.coin.name}</span>
                        <div className="flex flex-col w-full items-end">
                          <div className={`text-[1rem] duration-300 transition-all min-w-10 h-6
                          ${hideBalance ? 'bg-[rgba(180,235,255,0.7)] blur-sm rounded-lg' : ''}`}>
                          {hideBalance ? '' : `${isNaN(balance.amount * balance.coin.price) ? "$0.00"
                          : formatBalance(balance.amount * balance.coin.price)}`}
                          </div>
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
