"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";
import BackArrow from "@/components/icons/back-arrow.svg";
import Copy from "@/components/icons/copy.svg"

export default function Receive() {
  const { user, loading } = useAuth();
  const { wallets } = useWallet();
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  
  const formatAddress = (address) => {
    if (address && address.length > 20) {
      return `${address.slice(0, 5)}...${address.slice(-4)}`; 
    }
    return address;
  };
  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full h-[100vh] flex flex-col overflow-hidden">
      <div className="w-full h-full p-3">
        <div className="flex w-full items-center gap-4 mt-10">
          <BackArrow 
          onClick={() => router.push("/send")}
          className="w-5 h-5 cursor-pointer"/>
          <h1 className="font-bold text-2xl">Receive Crypto</h1>
        </div>
        <div className="relative w-full">
          <div className={`absolute top-10 left-1/2 
            -translate-x-1/2 z-50 transition-all duration-300 ease-in-out
            ${copied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5 pointer-events-none'}`}>
              <div className="bg-[#151515] px-4 py-2 rounded-xl text-white">
                <h1 className="text-center font-semibold text-sm">
                  Copied to Clipboard!
                </h1>
              </div>
            </div>
        </div>
        <div className="w-full h-full mt-36">
        {wallets && (
          <div className="flex flex-col gap-5">
          {wallets.map(wallet => (
            <div key={wallet.id}
            className="w-full border-[0.5px] rounded-2xl border-gray-900 h-24 flex
            flex-row px-4 py-1 hover:bg-[#050505]"
            style={{boxShadow: '0px 0px 120px -22px oklch(54.6% 0.245 262.881)'}}>
              <div className="flex-1 h-full items-center flex">
                <img className="w-10 h-10" src={`/assets/${wallet.chain.name}.png`}/>
              </div>
              <div className="flex-2 h-full flex flex-col justify-center items-start">
                <h1 className="font-bold text-sm">{wallet.chain.name} Address</h1> 
                <h1 className="font-normal text-gray-300 text-sm">{formatAddress(wallet.public_key)}</h1>
              </div>
              <div className="flex-1 h-full items-center justify-end flex">
                <button 
                onClick={() => handleCopy(wallet.public_key)}
                className="p-2 rounded-xl bg-blue-900 flex
            items-center justify-center hover:p-3
            hover:bg-blue-600 duration-300 transition-all"><Copy className="w-4 h-4
            rotate-180"/></button>
              </div>
            </div>
          ))}
          </div>
        )} 
        </div>
      </div>
    </div>
  );
}
