"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWallet } from "@/context/WalletContext"
import { ArrowLeft, SendIcon, AlertCircle } from "lucide-react"

export default function SendTransaction() {
  const router = useRouter()
  const { wallets, walletBalances, networks } = useWallet()

  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedCoin, setSelectedCoin] = useState(null)
  const [selectedNetwork, setSelectedNetwork] = useState(null)
  const [memo, setMemo] = useState("")
  const [showNetworkSelector, setShowNetworkSelector] = useState(false)
  const [showCoinSelector, setShowCoinSelector] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Form, 2: Confirmation

  // Filter coins based on selected network
  const filteredCoins = selectedNetwork
    ? walletBalances?.filter((balance) => balance.coin.chain.name === selectedNetwork.name)
    : walletBalances

  // Get max amount for selected coin
  const maxAmount = selectedCoin
    ? walletBalances?.find((balance) => balance.coin.id === selectedCoin.coin.id)?.amount || 0
    : 0

  useEffect(() => {
    // Set default network if available
    if (networks && networks.length > 0 && !selectedNetwork) {
      setSelectedNetwork(networks[0])
    }
  }, [networks, selectedNetwork])

  const handleNetworkSelect = (network) => {
    setSelectedNetwork(network)
    setShowNetworkSelector(false)
    setSelectedCoin(null) // Reset coin when network changes
  }

  const handleCoinSelect = (coin) => {
    setSelectedCoin(coin)
    setShowCoinSelector(false)
  }

  const handleMaxAmount = () => {
    setAmount(maxAmount.toString())
  }

  const validateForm = () => {
    if (!recipient) {
      setError("Recipient address is required")
      return false
    }
    if (!amount || Number.parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return false
    }
    if (Number.parseFloat(amount) > maxAmount) {
      setError("Amount exceeds available balance")
      return false
    }
    if (!selectedCoin) {
      setError("Please select a coin")
      return false
    }
    setError("")
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      setStep(2) // Move to confirmation step
    }
  }

  const handleConfirm = async () => {
    setLoading(true)
    try {
      // This would be replaced with your actual transaction API call
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call

      // Success - redirect to success page or home
      router.push("/?success=true")
    } catch (error) {
      setError("Transaction failed. Please try again.")
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const formatBalance = (balance) => {
    return Number(balance).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    })
  }

  return (
    <div className="w-full h-full min-h-[100vh] relative flex flex-col pb-20">
      {/* Header */}
      <div className="flex flex-row items-center justify-between mt-14 mx-[1.75rem]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => (step === 1 ? router.push("/") : setStep(1))}
            className="p-2 rounded-full hover:bg-[#252525] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold">{step === 1 ? "Send" : "Confirm Transaction"}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col px-[1.75rem] mt-8 w-full">
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-3 mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
            {/* Network Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-sm">Network</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNetworkSelector(!showNetworkSelector)}
                  className="w-full flex items-center justify-between bg-[#252525] rounded-lg p-3 hover:bg-[#303030] transition-colors"
                >
                  {selectedNetwork ? (
                    <div className="flex items-center gap-2">
                      <img src={`/assets/${selectedNetwork.name}.png`} alt={selectedNetwork.name} className="w-6 h-6" />
                      <span>{selectedNetwork.name}</span>
                    </div>
                  ) : (
                    <span className="text-gray-400">Select Network</span>
                  )}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showNetworkSelector && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#252525] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {networks?.map((network) => (
                      <button
                        key={network.id}
                        type="button"
                        onClick={() => handleNetworkSelect(network)}
                        className="w-full flex items-center gap-2 p-3 hover:bg-[#303030] transition-colors"
                      >
                        <img src={`/assets/${network.name}.png`} alt={network.name} className="w-6 h-6" />
                        <span>{network.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Coin Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-sm">Coin</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCoinSelector(!showCoinSelector)}
                  className="w-full flex items-center justify-between bg-[#252525] rounded-lg p-3 hover:bg-[#303030] transition-colors"
                  disabled={!selectedNetwork}
                >
                  {selectedCoin ? (
                    <div className="flex items-center gap-2">
                      <img
                        src={`/assets/${selectedCoin.coin.chain.name}.png`}
                        alt={selectedCoin.coin.name}
                        className="w-6 h-6"
                      />
                      <div className="flex flex-col">
                        <span>{selectedCoin.coin.name}</span>
                        <span className="text-xs text-gray-400">
                          Balance: {formatBalance(selectedCoin.amount)} {selectedCoin.coin.symbol}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Select Coin</span>
                  )}
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M6 9L12 15L18 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showCoinSelector && (
                  <div className="absolute top-full left-0 w-full mt-1 bg-[#252525] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {filteredCoins?.map((coin) => (
                      <button
                        key={coin.id}
                        type="button"
                        onClick={() => handleCoinSelect(coin)}
                        className="w-full flex items-center gap-2 p-3 hover:bg-[#303030] transition-colors"
                      >
                        <img src={`/assets/${coin.coin.chain.name}.png`} alt={coin.coin.name} className="w-6 h-6" />
                        <div className="flex flex-col items-start">
                          <span>{coin.coin.name}</span>
                          <span className="text-xs text-gray-400">
                            Balance: {formatBalance(coin.amount)} {coin.coin.symbol}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recipient Address */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-sm">Recipient Address</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter wallet address"
                className="w-full bg-[#252525] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Amount */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-gray-400 text-sm">Amount</label>
                {selectedCoin && (
                  <button type="button" onClick={handleMaxAmount} className="text-blue-500 text-sm">
                    Max
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.000001"
                  min="0"
                  className="w-full bg-[#252525] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {selectedCoin && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {selectedCoin.coin.symbol}
                  </div>
                )}
              </div>
              {selectedCoin && (
                <div className="text-xs text-gray-400">
                  Available: {formatBalance(maxAmount)} {selectedCoin.coin.symbol}
                </div>
              )}
            </div>

            {/* Memo/Note (Optional) */}
            <div className="flex flex-col gap-2">
              <label className="text-gray-400 text-sm">Memo (Optional)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note to this transaction"
                className="w-full bg-[#252525] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 rounded-lg p-4 mt-4 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              style={{ boxShadow: "0 0px 20px -7px oklch(88.2% 0.059 254.128)" }}
            >
              <SendIcon className="w-5 h-5" />
              Continue
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {/* Transaction Summary */}
            <div className="bg-[#252525] rounded-lg p-4">
              <h2 className="text-lg font-medium mb-4">Transaction Summary</h2>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <div className="flex items-center gap-2">
                    <img src={`/assets/${selectedNetwork.name}.png`} alt={selectedNetwork.name} className="w-5 h-5" />
                    <span>{selectedNetwork.name}</span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Coin</span>
                  <span>
                    {selectedCoin.coin.name} ({selectedCoin.coin.symbol})
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Amount</span>
                  <span>
                    {formatBalance(amount)} {selectedCoin.coin.symbol}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient</span>
                  <span className="text-right max-w-[200px] truncate">{recipient}</span>
                </div>

                {memo && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memo</span>
                    <span className="text-right max-w-[200px]">{memo}</span>
                  </div>
                )}

                <div className="flex justify-between pt-2 border-t border-gray-700 mt-2">
                  <span className="text-gray-400">Network Fee</span>
                  <span>~0.0001 {selectedCoin.coin.symbol}</span>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-lg p-3 mb-2">
              <p className="text-yellow-400 text-sm">
                Please verify all details carefully. Transactions cannot be reversed once confirmed.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-[#353535] rounded-lg p-4 font-medium hover:bg-[#404040] transition-colors"
              >
                Edit
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-blue-600 rounded-lg p-4 font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                style={{ boxShadow: "0 0px 20px -7px oklch(88.2% 0.059 254.128)" }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <SendIcon className="w-5 h-5" />
                    Confirm & Send
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
