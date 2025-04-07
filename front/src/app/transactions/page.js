'use client';
import React, { useState } from 'react';
import './transactions.css';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'Send',
      amount: '0.5 ETH',
      to: '0xAbC123...789',
      date: 'Apr 7, 2025',
      status: 'Success',
    },
    {
      id: 2,
      type: 'Receive',
      amount: '1.2 ETH',
      from: '0xDeF456...321',
      date: 'Apr 6, 2025',
      status: 'Success',
    },
  ]);

  const [formData, setFormData] = useState({ address: '', amount: '' });
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (formData.address && formData.amount) {
      setMessage('✅ Transaction sent!');
      setFormData({ address: '', amount: '' });
    } else {
      setMessage('⚠️ Please fill in all fields.');
    }
  };

  return (
    <div className="transactions-container">
      <h1>My Wallet</h1>
      <div className="balance">Balance: 3.45 ETH</div>

      <div className="send-section">
        <h2>Send Crypto</h2>
        <input
          type="text"
          placeholder="Recipient address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <input
          type="number"
          placeholder="Amount (ETH)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
        />
        <button onClick={handleSend}>Send</button>
        {message && <p className="status-message">{message}</p>}
      </div>

      <div className="history-section">
        <h2>Transaction History</h2>
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-card">
              <p><strong>{tx.type}</strong> {tx.amount}</p>
              <p>{tx.to ? `To: ${tx.to}` : `From: ${tx.from}`}</p>
              <p>{tx.date}</p>
              <span className={`status ${tx.status.toLowerCase()}`}>{tx.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;
