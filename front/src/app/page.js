"use client"
import Image from "next/image";
import axiosInstance from "../lib/axios";
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    // we can add a spinner component later
    return <div>Loading...</div>
  }

  if (!user) {
    return null;
  }
  const handleLogout = async () => {
    const response = await logout();
      if (!response.success) {
        setError(response.error);
      } 
  } 

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className='flex justify-end w-full'>
        <button
          onClick={handleLogout}>Log out</button>
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div>
            <h1>Welcome {user.first_name} {user.last_name}</h1>
        </div>
      </main>
    </div>
  );
}
