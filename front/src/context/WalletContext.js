"use client"
import React, { useEffect, useContext, createContext, useState } from "react";
import axiosInstance from "../lib/axios";
import { useAuth } from "./AuthContext";

export const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const {user, loading} = useAuth();
  const [wallets, setWallets] = useState(null);
  const [walletBalances, setWalletBalances] = useState(null);
  const [networks, setNetworks] = useState(null);
  const [marketData, setMarketData] = useState({});
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMarketData = async () => {
    try {
      const response = await axiosInstance.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd"
      );
      setMarketData({
        BTC: { price: response.data.bitcoin.usd },
        ETH: { price: response.data.ethereum.usd },
        SOL: { price: response.data.solana.usd },
      });
      return response.data;
    } catch (err) {
      console.error("Failed to load market data", err);
      return null;
    }
  };

  const fetchWallets = async () => {
    try{
      const response = await axiosInstance.get('/api/wallets/');
      setWallets(response.data);
      return response.data;
    }catch(error){
      console.error("Failed to fetch wallets:", error);
      setError("Couldn't fetch wallets");
      return null;
    }
  };

  const fetchAllBalances = async (walletsData) => {
    try{
      setWalletLoading(true);
      const balances = [];
      const chains = [];
      for (const wallet of walletsData) {
        if (!chains.includes(wallet.chain.name)) {
          chains.push(wallet.chain);
        }
        const response = await axiosInstance.get(
          `/api/wallets/${wallet.id}/balances/`
        );
        balances.push(...response.data);
      }
      setWalletBalances(balances);
      setNetworks(chains);

      return {balances, chains};
    } catch (error) {
      console.error("Failed to fetch balances:", error);
      setError("Couldn't fetch balances");
      return null;
    } finally {
      setWalletLoading(false);
    }
  };

  const initializeWalletData = async () => {
    if (!user) return;
    setWalletLoading(true);
    try {
      const walletsData = await fetchWallets();
      const marketData = await fetchMarketData();
      if (walletsData && walletsData.length > 0) {
        return await fetchAllBalances(walletsData);
      } else {
        setWalletLoading(false);
      }
    } catch (error) {
      console.error("Error init wallet", error);
      setError("Failed to init wallet data");
      setWalletLoading(false);
    }
  };

  const refreshWalletData = async () => {
    return initializeWalletData();
  };

  const updateWalletBalance = async (walletId, coinId, newAmount) => {
    try {
      await axiosInstance.patch(
        `/api/wallets/${walletId}/coins/${coinId}/balance/`,
        {amount: newAmount}
      );
      return refreshWalletData();
    } catch (error) {
      console.error("Failed to update balance", error);
      setError("Couldn't update balance");
      return null;
    }
  };
  useEffect(() => {
    if (user && !loading){
      initializeWalletData();

      const interval = setInterval(() => {
        fetchMarketData();
      }, 600000); // every 10 mins, more usage can lead to pricing options kaboom
      
      return () => clearInterval(interval);
    }
  }, [user, loading]);

  return (
    <WalletContext.Provider value={{
      wallets,
      walletBalances,
      networks,
      walletLoading,
      error,
      refreshWalletData,
      updateWalletBalance,
      marketData,
      fetchMarketData,
    }}>
      {children}
    </WalletContext.Provider>
  );

};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
