"use client"
import React, { useState, useEffect, useMemo} from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";


const SendPage = () => {
  const {walletBalances, updateWalletBalance,
    refreshWalletData, walletLoading, marketData} = useWallet();
  const [inputValue, setInputValue] = useState("");
  const [usdMode, setUsdMode] = useState(true);
  const [activeWalletBalance, setActiveWalletBalance] = useState(null);
  const { user, loading } = useAuth();
  const router = useRouter();

  const formatNumber = (value) => {
    const number = Number(value);
    if (isNaN(number)) return "0";

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: usdMode ? 2 : 7,
    });
  };

  const formatTokenAmount = (value) => {
    const number = Number(value);
    if (isNaN(number)) return "0";
    const formatted = number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 5,
    });
    const plainFormatted = formatted.replace(/,/g, "");

    if (plainFormatted.length > 9) {
      return formatted.slice(0, 9) + "...";
    }
    return formatted;
  };

  const buttons = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    ".", "0", "DEL",
  ];

  const handleInputChange = (val) => {
    if (val === "DEL"){
      setInputValue(prev => prev.slice(0, -1));
    } else {
      if (val === "." && inputValue.includes(".")) return;
      if (inputValue.includes(".") &&
        (inputValue.length - 1) - (inputValue.lastIndexOf(".")) == 2) return;
      if (inputValue.length > 11) return;
      setInputValue(prev => prev + val);
    }
  };

  const formattedAmount = (value) => {
    if (!activeWalletBalance || !marketData) return "--";

    const number = Number(value);
    const sym = activeWalletBalance.coin.symbol?.toUpperCase();
    const price = Number(marketData[sym]?.price || 0);
    if (isNaN(number) || isNaN(price) || price === 0) return "--";

    let result = usdMode ? number / price : number * price;

    return result.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: usdMode ? 10 : 2,
    });
  };

  const handleModeChange = () => {
    if (marketData) {
      setUsdMode(prev => !prev);
      setInputValue(formattedAmount);
    }
  };

  const handleMaxPress = () => {
    if (marketData && activeWalletBalance) {
      const sym = activeWalletBalance.coin.symbol?.toUpperCase();
      const price = Number(marketData[sym]?.price || 0); 
      return usdMode ? setInputValue(prev => String(Number(prev) * price)) :
      setInputValue(prev => String(Number(prev) / price));
    }
  };

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && walletBalances && !walletLoading){
      setActiveWalletBalance(walletBalances[0]);
    }
  }, [user, walletBalances, walletLoading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-[100vh] w-full relative flex flex-col px-4 overflow-hidden">
      <div className="flex flex-row w-full flex-1 items-end pt-10">
        <div className={`flex flex-row w-full h-32 items-center
          ${inputValue.length > 8 ? 'text-3xl' : inputValue.length > 4 ? 'text-4xl'
            : 'text-6xl'}`}>
          <span className="font-semibold">
            {inputValue ? formatNumber(inputValue) : "0"}
          </span>
          <span className="font-normal text-gray-500">{'\u00A0'}{usdMode ? 'USD' :
              activeWalletBalance.coin.symbol}</span>
        </div>
        <div className="flex h-32">
          {!Number(inputValue) && (
          <button 
          onClick={() => setInputValue(activeWalletBalance.amount)}
          className="px-4 bg-[#353535] rounded-xl h-8
          self-center flex items-center transition-all duration-300 hover:bg-[#404040]">
            <span className="text-sm font-bold">Max</span>
          </button>
          )}
        </div>  
      </div>
      <div className="-mt-2">
        {activeWalletBalance && (
        <button
        onClick={handleModeChange}
        className="flex flex-row text-blue-600 text-sm font-[500] cursor-pointer">
          <span>{formattedAmount(inputValue)}</span>
        </button>
        )}
      </div>
      <div className="flex w-full h-16 mt-14 items-center">
        {activeWalletBalance && (
        <button className="w-full flex flex-row
          px-2 py-3 items-center">
          <img src={`/assets/${activeWalletBalance.coin.chain.name}.png`}
          className="w-8 h-8"/>
          <h2 className="ml-3 font-bold text-lg w-full text-start">{activeWalletBalance.coin.name}</h2>
          <div className="flex flex-col w-32 justify-end text-end">
            <h2 className="font-[500]">{formatTokenAmount(activeWalletBalance.amount)}
           {'\u00A0'}{activeWalletBalance.coin.symbol}</h2>
            <h2 className="text-gray-400">Available</h2>
          </div>
          <h2 className="text-gray-400 ml-2">{`>`}</h2>
        </button>
        )}
      </div>
      <div className="flex flex-2 w-full items-center justify-center">
        <div className="grid grid-cols-3 gap-x-[5rem] gap-y-12">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleInputChange(btn)}
              className="text-2xl w-12 h-8 font-medium"
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-row flex-1">
        
      </div>
    </div>
  );
};

export default SendPage;

