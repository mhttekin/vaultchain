"use client";

import axiosInstance from "../lib/axios";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import EyeOpen from "../components/icons/eye-open.svg";
import EyeClose from "../components/icons/eye-close.svg";
import Copy from "../components/icons/copy.svg";
import Send from "../components/icons/send.svg";
import Buy from "../components/icons/cart.svg";
import Settings from "../components/icons/settings.svg";



export default function Home() {
  const { user, loading, logout } = useAuth();
  const {wallets, walletBalances, networks, walletLoading, refreshWalletData, marketData } = useWallet(); 
  const router = useRouter();
  const [error, setError] = useState("");
  const [mainLoading, setMainLoading] = useState(true);
  const [selectedNetworks, setSelectedNetworks] = useState([]);

  const [hideBalance, setHideBalance] = useState(false);
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
    if (user && walletBalances && walletBalances.length > 0) {
      setMainLoading(true);
      let amount = 0.0;
      walletBalances.forEach((balance) => {
        amount += Number(balance.amount) * marketData[balance.coin.symbol].price;
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
    return Number(balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (loading || walletLoading) {
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
        <div className="w-auto flex flex-col justify-start text-gray-200 font-bold">
          <span
          className="text-blue-500 font-semibold text-xl">Welcome</span>
          <span className="text-3xl text-white">{user.first_name} {user.last_name}</span>
        </div>
        <div className="relative">
        <button
        ref={settingsRef}
        className="cursor-pointer rounded-lg pt-2 pr-4"

        onClick={() => setSettingsOpen(prev => !prev)}>
          <Settings className="w-6 h-6"/> 
        </button>
        {settingsOpen && (
          <div
          ref={settingsBarRef}
          className="absolute top-8 -left-4 flex flex-col gap-2 bg-[#000000] 
          w-[4.5rem] h-20 p-1 py-2 justify-center rounded-lg">
            <Link href="/profile" className="border-b border-b-gray-700/50 pb-2">
            Profile</Link>
            <button onClick={handleLogout} className="text-left">Log out</button> 
          </div>
        )}
        </div> 
      </div>

      {/* Wallet Items */}
      <div className="relative w-full flex flex-col items-center
      mt-[4rem] border-b border-gray-700 pb-10 px-[1.75rem]">
        <div className="flex flex-col justify-center items-center relative max-w-40">
          <div className={`min-w-40 max-w-80 h-10 ${String(totalBalance).length > 5 ? 'text-3xl' : 'text-4xl'}
            text-center duration-300 transition-all
            ${hideBalance ? 'bg-[rgba(180,235,255,1)] blur-3xl rounded-lg' : ''}`}>
            {hideBalance ? '' : `$${formatBalance(totalBalance)}`}</div>
          <button className="flex self-start absolute top-[3.5rem] -left-2"
          onClick={() => setHideBalance(prev => !prev)}>
            {hideBalance ? <EyeOpen className="w-5 h-5"/> : <EyeClose className="w-5 h-5"/>}
          </button>
        </div>
        <div className="flex flex-row w-full gap-7 text-[0.8rem] items-center justify-center mt-12 h-20">
          <button 
          onClick={() => router.push('/receive')}
          className="flex flex-col justify-center items-center gap-2">
            <div className="flex bg-blue-600 w-10 h-10 rounded-lg hover:w-11 hover:h-11 transition-all
            duration-300 items-center justify-center"
            style={{boxShadow: '0 0px 20px -7px oklch(88.2% 0.059 254.128)'}}>
              <Copy className="w-6 h-6"/>
            </div>
            <span className="flex text-center">Receive</span>
          </button> 
          <button 
          onClick={() => router.push("/send")}
          className="flex flex-col justify-center items-center gap-2">
            <div className="flex bg-blue-600 w-10 h-10 rounded-lg hover:w-11 hover:h-11 transition-all
            duration-300 items-center justify-center"
            style={{boxShadow: '0 0px 20px -7px oklch(88.2% 0.059 254.128)'}}>
              <Send className="w-6 h-6"/>
            </div>
            <span className="flex text-center">Send</span>
          </button> 
          <button 
          onClick={() => router.push("/buy")}
          className="flex flex-col items-center justify-center gap-2">
            <div className="flex bg-blue-600 w-10 h-10 rounded-lg hover:w-11 hover:h-11 transition-all
            duration-300 items-center justify-center"
            style={{boxShadow: '0 0px 20px -7px oklch(88.2% 0.059 254.128)'}}>
              <Buy className="w-6 h-6"/>
            </div>
            <span className="flex text-center">Buy</span>
          </button> 
        </div>
        
      </div>
      <div className="flex w-full px-[1.75rem] flex-col">
        <div className="flex flex-col items-start mt-5 mb-2">
          <button 
          ref={filterButtonRef}
          className="py-1 px-3 bg-[#252525] rounded-2xl text-left
    hover:bg-blue-600 transition duration-300 ease-in-out"
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
                <button key={chain.id}
                className={`w-full flex py-1 px-3 ${
                selectedNetworks.includes(chain.name) ? 
                    'bg-[#151515] shadow-md inset-shadow' : ''
              }`}
                onClick={() => toggleNetwork(chain.name)}>
                {chain.name}
                </button>
              ))}
              <button 
              onClick={() => setFilterOpen(false)}
              className="w-full flex justify-center rounded-2xl py-3 p-2
              bg-[#353535] mt-5 hover:bg-blue-600 duration-300 ease-in-out shadow-md">Done</button>
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
                    items-center bg-[rgba(25,25,25,0.3)] rounded-lg py-3 px-2 
                    hover:bg-[rgba(30,30,30,0.4)] transition-all
                    duration-300"
                    style={{boxShadow: '0px 0px 120px -22px oklch(54.6% 0.245 262.881)'}}>
                      <img
                        src={`/assets/${balance.coin.chain.name}.png`}
                        alt={balance.coin.name}
                        className="w-8 h-8"
                      />
                      <div className="w-full flex flex-row items-center justify-between">
                        <span className="pl-1 coin-name">{balance.coin.name}</span>
                        <div className="flex flex-col w-full items-end">
                          <div className={`text-[1rem] duration-300 transition-all min-w-10 h-6 
                          ${hideBalance ? 'bg-[rgba(180,235,255,0.1)] blur-sm rounded-lg' : ''}`}>
                          ${hideBalance ? '' : `${isNaN(balance.amount * marketData[balance.coin.symbol].price)
                          ? "0.00"
                          : formatBalance(balance.amount * marketData[balance.coin.symbol].price)}`}
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
