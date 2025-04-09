"use client"

import { createContext, useContext, useState } from "react"

const WalletContext = createContext(null)

export const WalletProvider = ({ children }) => {
  const [wallets, setWallets] = useState([
    { id: "wallet1", name: "Wallet 1" },
    { id: "wallet2", name: "Wallet 2" },
  ])
  const [walletBalances, setWalletBalances] = useState([
    {
      id: "balance1",
      walletId: "wallet1",
      coin: { id: "coin1", name: "Bitcoin", symbol: "BTC", chain: { name: "Bitcoin" } },
      amount: 1.5,
    },
    {
      id: "balance2",
      walletId: "wallet1",
      coin: { id: "coin2", name: "Ethereum", symbol: "ETH", chain: { name: "Ethereum" } },
      amount: 5.0,
    },
    {
      id: "balance3",
      walletId: "wallet2",
      coin: { id: "coin1", name: "Bitcoin", symbol: "BTC", chain: { name: "Bitcoin" } },
      amount: 0.7,
    },
    {
      id: "balance4",
      walletId: "wallet2",
      coin: { id: "coin3", name: "Cosmos", symbol: "ATOM", chain: { name: "Cosmos" } },
      amount: 12.3,
    },
  ])
  const [networks, setNetworks] = useState([
    { id: "network1", name: "Bitcoin" },
    { id: "network2", name: "Ethereum" },
    { id: "network3", name: "Cosmos" },
  ])

  const value = {
    wallets,
    walletBalances,
    networks,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
