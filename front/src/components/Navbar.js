"use client"
import React from "react";
import Link from "next/link";
import "./Navbar.css";
import Home from "./icons/home.svg";
import History from "./icons/transcript.svg";
import Wallet from "./icons/wallet.svg"; 
import Transfer from "./icons/transfer.svg";
import { usePathname } from "next/navigation";






const Navbar = () => {
  const pathName = usePathname();

  return (
      <nav className="bottom-navigation">
        <Link href="/" className="nav-link">
          <Home className={`w-6 h-6 ${pathName === "/" ? 'drop-shadow-[0_0_12px_oklch(80%_0.1_262)] fill-blue-600' : 'fill-white'}`}/>
        </Link>
        <Link href="/transactionhistory" className="nav-link">
          <History className={`w-6 h-6 ${pathName === "/transactionhistory" ? 'drop-shadow-[0_0_12px_oklch(100%_0.1_262)] stroke-blue-600' : 'stroke-white'}`}/>
        </Link>
        <Link href="/send" className="nav-link">
          <Transfer className={`w-6 h-6  
            ${pathName === "/send" ? 'drop-shadow-[0_0_12px_oklch(100%_0.1_262)]  stroke-blue-600' : 'stroke-white'}`}/> 
        </Link>
        <Link href="/wallet" className="nav-link">
          <Wallet className={`w-6 h-6 ${pathName === "/wallet" ? 'drop-shadow-[0_0_12px_oklch(80%_0.1_262)] fill-blue-600' : 'fill-white'}`}/>
        </Link>
      </nav>
  );
};
export default Navbar;
