"use client"
import React from "react";
import Link from "next/link";
import "./Navbar.css";








const Navbar = () => {
  return (
      <nav className="bottom-navigation">
        <Link href="/" className="nav-link">
          Home
        </Link>
        <Link href="/transactionhistory" className="nav-link">
          History
        </Link>
        <Link href="/wallet" className="nav-link">
          Wallet
        </Link>
      </nav>
  );
};
export default Navbar;
