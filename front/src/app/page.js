"use client"

import axiosInstance from "../lib/axios";
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Home() {

  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [wallets, setWallets] = useState(null);
  const [mainLoading, setMainLoading] = useState(true);
  const [openNetwork, setOpenNetwork] = useState(false);
  const [selectedNetworks, setSelectedNetworks] = useState([]);
  const [displayNetworks, setDisplayNetworks] = useState('All Networks');
  
  const [walletBalances, setWalletBalances] = useState(null);
  const [totalBalance, setTotalBalance] = useState(0.00);

  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    if (user && !loading){
      const fetchWallets = async () => {
        try{
          const response = await axiosInstance.get('/api/wallets/');
          setWallets(response.data);
        } catch (error) {
          setError(error);
        }
      };
      fetchWallets();
    }
  }, [user, loading]);

  useEffect(() => {
    if (user &&  wallets && wallets.length > 0) {
      setMainLoading(true);
      const fetchBalances = async () => {
        try {
          const balances = [];
          for (const wallet of wallets){
            const response = await axiosInstance.get(`/api/wallets/${wallet.id}/balances/`);
            balances.push(response.data[0]);
          }
          setWalletBalances(balances);
        } catch (error) {
          setError(error);
          console.error(error);
        } finally {
          setMainLoading(false);
        }
      }
      fetchBalances();
    }
  }, [user, wallets]);

  useEffect(() => {
    if (user && walletBalances && walletBalances.length > 0) {
      setMainLoading(true);
      let amount = 0.00;
      walletBalances.forEach(balance => {
        amount += Number(balance.amount);
      });
      setTotalBalance(amount);
      setMainLoading(false);
    }
  }, [user, walletBalances]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)){
        setOpenNetwork(false);
      }
    }
    if (openNetwork) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openNetwork]);

  const handleLogout = async () => {
    const response = await logout();
      if (!response.success) {
        setError(response.error);
      } 
  }

  const handleNetworkFilter = (name) => {
    if (name === null) {
      setSelectedNetworks([]);
      setDisplayNetworks('All Networks');
      return
    }
    setSelectedNetworks((prevNetworks) => {
      const isSelected = prevNetworks.includes(name);
      const updatedNetwork = isSelected ? prevNetworks.filter(net => net !== name)
        : [...prevNetworks, name];
      setDisplayNetworks(updatedNetwork.length === 0 ? 'All Networks'
        : `Networks(${updatedNetwork.length})`);
      return updatedNetwork;
    }); 
  }

  const getFilteredBalances = () => {
    if (!walletBalances) return [];
    if (selectedNetworks.length === 0) {
      return walletBalances;
    }
    return walletBalances.filter(balance =>
      selectedNetworks.includes(balance.coin.chain.symbol)
    );
  };

  const formatBalance = (balance) => {
    return Number(balance).toFixed(2);
  };

  if (loading) {
    // we can add a spinner component later
    return <div>Loading...</div>
  }

  if (!user) {
    return null;
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className='flex justify-end w-full'>
        <button
          onClick={handleLogout}>Log out</button>
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
          <h1>Welcome {user.first_name} {user.last_name}</h1>
          <h2>Current Balance: {formatBalance(totalBalance)}</h2>
          <div className='relative' ref={dropdownRef}>
            <button onClick={() => setOpenNetwork(!openNetwork)}>{displayNetworks} {openNetwork ? "▲" : "▼"}</button>
            {openNetwork && (
              <div className='bg-gray-900 flex flex-col absolute z-10'>
                <button onClick={() => handleNetworkFilter(null)} className='text-start'>All Networks</button>
                {wallets.map(wallet => (
                  <button 
                    key={wallet.id}
                    onClick={() => handleNetworkFilter(wallet.chain.symbol)}
                    className='text-start'>
                      <span>{wallet.chain.name}</span>
                  </button>
                ))}
              </div>
              )}
          </div>
          <div className='mt-20'>
            {walletBalances && (
              <div className='flex flex-col'>
                {getFilteredBalances().length > 0 ? (
                  getFilteredBalances().map(balance => (
                    <button
                      key={balance.id}
                      className='text-start'>
                      {balance.coin.name} : {balance.amount} {balance.coin.symbol}
                    </button>
                  ))
                ) : (
                  <div className="text-gray-400">No balances to display for selected networks</div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
