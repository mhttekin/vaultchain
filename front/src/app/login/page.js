"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import "./auth.css";

export default function Auth() {
  const router = useRouter();
  const { register, login, user, loading } = useAuth();
  const fallingContainerRef = useRef(null); // Use a ref for the falling-items container

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [registerForm, setRegisterForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const response = await login(loginForm.email, loginForm.password);
    if (response.success) {
      router.push("/");
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const response = await register(
      registerForm.email,
      registerForm.password,
      registerForm.first_name,
      registerForm.last_name
    );
    if (response.success) {
        router.push("/");
    } else {
      setError(response.error);
    }
    setIsLoading(false);
  };

  // Falling items logic
  useEffect(() => {
    // Ensure the container exists
    const timeout = setTimeout(() => {
    if (fallingContainerRef && fallingContainerRef.current){
      const fallingContainer = fallingContainerRef.current;
      const assets = ["/assets/bitcoin.png", "/assets/ethereum.png", "/assets/solana.png"]; // Add your PNG paths here

      function createFallingItem() {
        const item = document.createElement("img");
        item.src = assets[Math.floor(Math.random() * assets.length)]; // Randomly select an asset
        item.className = "falling-item";
        item.style.left = `${Math.random() * 100}vw`; // Random horizontal position
        item.style.animationDuration = `${Math.random() * 3 + 2}s`; // Random fall duration
        item.style.animationDelay = `${Math.random() * 1}s`; // Random delay
        fallingContainer.appendChild(item);

        // Remove the item after the animation ends
        item.addEventListener("animationend", () => {
          item.remove();
        });
      }

      function createFallingBatch() {
        const batchSize = 10; // Number of coins to create in each batch
        for (let i = 0; i < batchSize; i++) {
          createFallingItem();
        }
      }

      // Create a batch of falling items every 3 seconds
      const interval = setInterval(createFallingBatch, 3000);

      return () => clearInterval(interval); // Cleanup on component unmount
    }
    }, 100); // waits to fully load the dom 
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading...</div>;
  }
  if (user) {
    return null;
  }

  return (
    <div className="animated-background">
      <div className="falling-items" ref={fallingContainerRef}></div> 
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-buttons">
            <button
              onClick={() => setIsLogin(true)}
              className={isLogin ? "active" : ""}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={!isLogin ? "active" : ""}
            >
              Register
            </button>
          </div>

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
              />
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
              />
              {error && <p className="error-message">{error}</p>}
              <button type="submit">Login</button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={registerForm.first_name}
                onChange={handleRegisterChange}
                required
              />
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={registerForm.last_name}
                onChange={handleRegisterChange}
                required
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
              />
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
              />
              {error && <p className="error-message">{error}</p>}
              <button type="submit">Register</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
