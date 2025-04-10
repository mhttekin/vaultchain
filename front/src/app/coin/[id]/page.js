"use client"

import React, { useState, useEffect} from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import TransferIcon from "@/components/icons/transfer.svg";
import BackArrow from "@/components/icons/back-arrow.svg"
import axios from "axios";
import Buy from "@/components/icons/cart.svg";
import Send from "@/components/icons/send.svg";
import Receive from "@/components/icons/copy.svg";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

export default function CoinInfo() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { id } = useParams();
  const {walletLoading, marketData, fetchHistoricalData, walletBalances} = useWallet();
  const [priceData, setPriceData] = useState([]);
  const [firstValue, setFirstValue] = useState(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [dayMode, setDayMode] = useState("1d");
  const [hoveredPrice, setHoveredPrice] = useState(null);
  const [theBalance, setTheBalance] = useState(null);

  const nameMap = {
    bitcoin: "Bitcoin",
    ethereum: "Ethereum",
    solana: "Solana",
  }; 
  const symbolMap = {
    bitcoin: "BTC",
    ethereum: "ETH",
    solana: "SOL",
  };
  
  const timeModes = [
    { label: "1H", value: "1h" },
    { label: "1D", value: "1d" },
    { label: "1W", value: "1w" },
    { label: "1M", value: "1m" },
    { label: "3M", value: "3m" },
  ];

  useEffect(() => {
    if (id && router) {
      setInfoLoading(true);
      const allowed = ["bitcoin", "ethereum", "solana"];
      if (!allowed.includes(id) || id !== id.toLowerCase()) {
        router.push('/');
      }
      setInfoLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (walletBalances && !theBalance) {
      const matched = walletBalances.find(
        (balance) => balance.coin.name.toLowerCase() === id.toLowerCase()
      );
      if (matched) setTheBalance(matched);
    }
  }, [walletBalances, walletLoading]);


  const formatNumber = (value, mode) => {
    const number = Number(value);
    if (isNaN(number)) return "0.00";

    return number.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: mode ? 2 : 7,
    });
  };

useEffect(() => {
  if (!infoLoading){
    const load = async () => {
      setInfoLoading(true); 
      const result = await fetchHistoricalData(id, dayMode);
      if (result) {
        setPriceData(result.data);
        console.log(result.data);
        setFirstValue(result.data[0]);
        if (result.fromCache) {
          setInfoLoading(false);
        } else {
          setTimeout(() => setInfoLoading(false), 300);
        }
      } else {
        setInfoLoading(false);
      }
    };
    load();
  }
}, [id, dayMode, fetchHistoricalData, infoLoading]);



  useEffect(() => {
    if (!user && !loading){
      router.push('/login');
    }
  }, [user, loading]);

  if (!user) return null;
  if (loading || walletLoading) return <p>Loading...</p>
  return (
    <div className="w-full h-[100vh] overflow-hidden">
      <div className="w-full flex flex-col px-3 h-full gap-3">
        <div className="w-full h-10 flex items-center mt-5">
          <BackArrow onMouseDown={() => router.push("/")}className="w-6 h-6"/>
        </div> 
        <div className="w-full min-h-20 flex flex-col gap-5 items-start px-2">
          <img src={`/assets/${id}.png`} className="w-5 h-5"/>
          <h1 className="font-bold text-[15px] text-gray-400">{nameMap[id]} price</h1>
          {marketData && (<h1 className="font-bold text-3xl">
          ${formatNumber(hoveredPrice ?? marketData[symbolMap[id]].price, true)}</h1>)}
        <div className="relative">
          {firstValue && (<h1 
            className={`absolute text-xs top-0 font-semibold -mt-3 
            ${hoveredPrice
            ? (hoveredPrice > firstValue.price ? 'text-green-500/90' : 'text-red-500/90')
            : (marketData[symbolMap[id]]?.price > firstValue.price 
            ? 'text-green-500/90' : 'text-red-500/90')}`}>
            {hoveredPrice ? formatNumber(hoveredPrice - firstValue.price, true)
            : formatNumber(marketData[symbolMap[id]]?.price - firstValue.price, true)} 
            (
              {
              hoveredPrice
              ? formatNumber((hoveredPrice / firstValue.price) * 10, true)
              : formatNumber((marketData[symbolMap[id]]?.price / firstValue.price) * 10, true)
              }%)</h1>)}
        </div>
      </div>
      <div className="w-full min-h-52 flex justify-center items-center py-6 outline-none focus:outline-none select-none"
        style={{
          outline: "none", userSelect: "none", 
          WebkitUserSelect: "none"}}>
          <ResponsiveContainer width="95%" height="100%">
            <LineChart
              data={priceData}
              style={{
                outline: "none",
              }}
              onMouseMove={(e) => {
                if (e && e.activePayload 
                && e.activePayload.length > 0) {
                  const price = e.activePayload[0].value;
                  setHoveredPrice(price);
                }
              }}
              onMouseLeave={() => setHoveredPrice(null)}
              margin={{ top: 10, right: 0, left: -50, bottom: 0 }}
            >
              <XAxis dataKey="date" tick={false} axisLine={false} />
              <YAxis domain={["auto", "auto"]} tick={false} axisLine={false} />

              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "#151515",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "0.875rem",
                  padding: "8px",
                }}
                wrapperStyle={{ visibility: "hidden" }}
                labelStyle={{ display: "none" }}
                formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
              />

              <Line
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {timeModes && (
          <div className="w-full min-h-20 -mt-5 flex justify-between">
            {timeModes.map(mode => (
              <button
              key={mode.value}
              className={`flex w-10 h-7 rounded-xl font-bold
              text-[13px] justify-center items-center 
              ${mode.value === dayMode ? 'bg-blue-500/30'
              : ''}`}
              onClick={() => setDayMode(mode.value)}>
                <span>{mode.label}</span>
              </button>
            ))} 
          </div>
        )}
        <div className="w-full flex">
        {theBalance && (
          <div className="flex flex-col min-h-20 justify-start items-start gap-1">
            <h1 className="font-bold text-[13px] text-gray-400">Your Balance</h1>
            <h1 className="text-xl font-bold">${formatNumber(theBalance.amount * marketData[symbolMap[id]].price, true)}</h1>
            <h1 className="text-[13px] font-bold text-gray-400">{formatNumber(theBalance.amount)}{"\u00A0"}{theBalance.coin.symbol}</h1>
          </div>
        )}
        </div>
        <div className="w-full mt-3 flex justify-center gap-0 flex-row min-h-10 text-[13px]">
          <button
          onClick={() => router.push('/buy')}
          className="flex flex-col items-center w-20 h-15"><div className="rounded-xl w-7 h-7 bg-gray-500 flex items-center justify-center hover:bg-gray-400
     transition-all duration-300">
        <Buy className="w-4 h-4"/>
    </div><span>Buy</span></button>
          <button 
          onClick={() => router.push('/send')}
          className="flex flex-col items-center w-20 h-15"><div className="rounded-xl w-7 h-7 bg-gray-500 flex items-center justify-center hover:bg-gray-400
     transition-all duration-300">
      <Send className="w-4 h-4"/>
    </div><span>Send</span></button>
          <button 
          onClick={() => router.push('/receive')}
          className="flex flex-col items-center w-20 h-15">
            <div className="rounded-xl w-7 h-7 bg-gray-500 flex items-center justify-center hover:bg-gray-400
     transition-all duration-300">
      <Receive className="w-4 h-4"/>
    </div><span>Receive</span></button>
        </div>
      </div>
    </div>
  );
};
