"use client";

import React, { useEffect, useState } from "react";
import axiosInstance from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./walletpage.css";

export default function WalletPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [wallets, setWallets] = useState([]);
  const [balances, setBalances] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [marketData, setMarketData] = useState({});
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [actionType, setActionType] = useState("buy");
  const [amount, setAmount] = useState("");
  const [depositInfo, setDepositInfo] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({ recipient: "", coinId: "", amount: "" });

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchMarketData().then(() => fetchWallets());
    }
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchWallets = async () => {
    try {
      const res = await axiosInstance.get("/api/wallets/");
      setWallets(res.data);

      let allBalances = [];
      let total = 0;

      for (const wallet of res.data) {
        const balRes = await axiosInstance.get(`/api/wallets/${wallet.id}/balances/`);
        allBalances.push(...balRes.data);

        for (const bal of balRes.data) {
          const price = marketData[bal.coin.symbol]?.price || 0;
          total += Number(bal.amount) * price;
        }
      }

      setBalances(allBalances);
      setTotalValue(total);

      const txRes = await axiosInstance.get("/api/transactions/");
      setTransactions(txRes.data);
    } catch (err) {
      setError("Error fetching wallet data");
      console.error(err);
    }
  };

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
    } catch (err) {
      console.error("Failed to load market data", err);
    }
  };

  const openModal = (walletId, coinId, type) => {
    setModalData({ walletId, coinId });
    setActionType(type);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
    setAmount("");
    setDepositInfo(null);
  };

  const handleTransaction = async () => {
    try {
      const wallet = wallets.find(w => w.id === modalData.walletId);
      const balanceObj = balances.find(b => b.wallet.id === modalData.walletId && b.coin.id === modalData.coinId);
      const currentAmount = parseFloat(balanceObj?.amount || 0);
      const value = parseFloat(amount);

      if (actionType === "buy") {
        await axiosInstance.patch(`/api/wallets/${modalData.walletId}/coins/${modalData.coinId}/balance/`, {
          amount: currentAmount + value
        });
      } else {
        if (value > currentAmount) {
          setDepositInfo({ wallet: wallet.public_key });
          return;
        }
        await axiosInstance.patch(`/api/wallets/${modalData.walletId}/coins/${modalData.coinId}/balance/`, {
          amount: currentAmount - value
        });
      }

      closeModal();
      fetchWallets();
    } catch (err) {
      console.error("Transaction failed", err);
      alert("Transaction failed");
    }
  };

  const handleTransfer = async () => {
    try {
      await axiosInstance.post("/api/transactions/create", {
        sender_public_key: wallets[0].public_key,
        recipient_public_key: transferData.recipient,
        coin_id: parseInt(transferData.coinId),
        amount: parseFloat(transferData.amount),
      });
      setTransferData({ recipient: "", coinId: "", amount: "" });
      setShowTransfer(false);
      fetchWallets();
    } catch (err) {
      alert("Transfer failed: " + err?.response?.data?.detail || "Unknown error");
      console.error(err);
    }
  };
  if (!user) return null;
  if (loading) return <p>Loading...</p>

  return (
    <div className="walletpage-container">
      {/* Add the header here */}
      <div className="walletpage-header">
        <h1>Welcome, {user?.first_name}</h1>
        <p className="walletpage-info">
          The values displayed below reflect the current market prices.
        </p>
      </div>

      <div className="walletpage-ticker">
        {Object.entries(marketData).map(([key, data]) => (
          <span key={key}>{key}: ${data.price}</span>
        ))}
      </div>

      <div className="walletpage-content myBUTTON">
        <h2>Total Portfolio Value: ${totalValue.toFixed(2)}</h2>
        <button className="walletpage-transfer-btn" onClick={() => setShowTransfer(true)}>Send Crypto</button>
        <button onClick={fetchWallets}>Refresh</button>
        
        {wallets.map((wallet) => (
          <div key={wallet.id} className="walletpage-wallet">
            <h3>{wallet.chain.symbol} Wallet</h3>
            <p>Public Key: {wallet.public_key}</p>

            {balances
              .filter((b) => b.wallet.id === wallet.id)
              .map((balance) => (
                <div key={balance.id} className="walletpage-coin">
                  <strong>
                    {balance.coin.name} ({balance.coin.symbol}): {balance.amount}
                  </strong>
                  <p>
                    Value: ${
                      (marketData[balance.coin.symbol]?.price || 0) *
                      Number(balance.amount)
                    }</p>
                  <button onClick={() => openModal(wallet.id, balance.coin.id, "buy")}>Buy</button>
                  <button onClick={() => openModal(wallet.id, balance.coin.id, "sell")}>Sell</button>
                </div>
              ))}
          </div>
        ))}


        {error && <p className="walletpage-error">{error}</p>}
      </div>

      {showModal && (
        <div className="walletpage-modal">
          <div className="walletpage-modal-content">
            <h3>{actionType.toUpperCase()} CRYPTO</h3>
            {depositInfo ? (
              <>
                <p>Insufficient balance. Please deposit to:</p>
                <input value={depositInfo.wallet} readOnly />
                <button onClick={() => navigator.clipboard.writeText(depositInfo.wallet)}>Copy Address</button>
                <button onClick={closeModal}>Close</button>
              </>
            ) : (
              <>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                />
                <br />
                <button onClick={handleTransaction}>{actionType === "buy" ? "Confirm Purchase" : "Confirm Sell"}</button>
                <button onClick={closeModal}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}

      {showTransfer && (
        <div className="walletpage-modal">
          <div className="walletpage-modal-content">
            <h3>Send Crypto</h3>
            <input
              type="text"
              placeholder="Recipient public key or email"
              value={transferData.recipient}
              onChange={(e) => setTransferData({ ...transferData, recipient: e.target.value })}
            />
            <input
              type="number"
              placeholder="Amount"
              value={transferData.amount}
              onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
            />
            <select
              value={transferData.coinId}
              onChange={(e) => setTransferData({ ...transferData, coinId: e.target.value })}
            >
              <option value="">Select Coin</option>
              {balances.map(b => (
                <option key={b.coin.id} value={b.coin.id}>{b.coin.name}</option>
              ))}
            </select>
            <button onClick={handleTransfer}>Transfer</button>
            <button onClick={() => setShowTransfer(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
