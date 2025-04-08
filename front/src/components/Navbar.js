"use client"
import React from "react";
import Link from "next/link";
import "./Navbar.css";
import Home from "./icons/home.svg";
import History from "./icons/transcript.svg";
import Wallet from "./icons/wallet.svg"; 
import { usePathname } from "next/navigation";






const Navbar = () => {
  const pathName = usePathname();

  return (
      <nav className="bottom-navigation">
        <Link href="/" className="nav-link">
          <Home className={`w-6 h-6 ${pathName === "/" ? 'fill-blue-600' : 'fill-white'}`}/>
        </Link>
        <Link href="/transactionhistory" className="nav-link">
          <History className={`w-6 h-6 ${pathName === "/transactionhistory" ? 'stroke-blue-600' : 'stroke-white'}`}/>
        </Link>
        <Link href="/wallet" className="nav-link">
          <Wallet className={`w-6 h-6 ${pathName === "/wallet" ? 'fill-blue-600' : 'fill-white'}`}/>
        </Link>
      </nav>
  );
};
export default Navbar;
