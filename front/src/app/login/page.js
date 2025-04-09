"use client";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import "./auth.css";

export default function Auth() {
  const router = useRouter();
  const { register, login, user, loading } = useAuth();
  const fallingContainerRef = useRef(null);

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
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordRecommendations, setPasswordRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value,
    });

    if (name === "password") {
      const { strength } = evaluatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const evaluatePasswordStrength = (password) => {
    let strength = "";
    const recommendations = [];

    if (password.length < 8) {
      recommendations.push("Password should be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      recommendations.push("Add at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      recommendations.push("Add at least one lowercase letter.");
    }
    if (!/\d/.test(password)) {
      recommendations.push("Add at least one number.");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      recommendations.push("Add at least one special character (e.g., !, @, #, $, etc.).");
    }

    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password)
    ) {
      strength = "Strong";
    } else if (recommendations.length <= 2) {
      strength = "Medium";
    } else {
      strength = "Weak";
    }

    return { strength, recommendations };
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

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

    const { strength, recommendations } = evaluatePasswordStrength(registerForm.password);

    if (recommendations.length > 0) {
      setError("Password does not meet the requirements:");
      setPasswordRecommendations(recommendations);
      setIsLoading(false);
      return;
    } else {
      setPasswordRecommendations([]);
    }

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
    const timeout = setTimeout(() => {
      if (fallingContainerRef && fallingContainerRef.current) {
        const fallingContainer = fallingContainerRef.current;
        const assets = ["/assets/bitcoin.png", "/assets/ethereum.png", "/assets/solana.png"];

        function createFallingItem() {
          const item = document.createElement("img");
          item.src = assets[Math.floor(Math.random() * assets.length)];
          item.className = "falling-item";
          item.style.left = `${Math.random() * 100}vw`;
          item.style.animationDuration = `${Math.random() * 3 + 2}s`;
          item.style.animationDelay = `${Math.random() * 1}s`;
          fallingContainer.appendChild(item);

          item.addEventListener("animationend", () => {
            item.remove();
          });
        }

        function createFallingBatch() {
          const batchSize = 10;
          for (let i = 0; i < batchSize; i++) {
            createFallingItem();
          }
        }

        const interval = setInterval(createFallingBatch, 3000);

        return () => clearInterval(interval);
      }
    }, 100);
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
                onChange={(e) => {
                  handleRegisterChange(e);
                  const { strength } = evaluatePasswordStrength(e.target.value);
                  setPasswordStrength(strength);
                }}
                required
              />

              {/* Password Strength Indicator */}
              <div className="password-strength-indicator">
                <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                  Password Strength: {passwordStrength || "N/A"}
                </p>
                <div className="strength-bar">
                  <div
                    className={`strength-level ${passwordStrength.toLowerCase()}`}
                    style={{
                      width:
                        passwordStrength === "Strong"
                          ? "100%"
                          : passwordStrength === "Medium"
                          ? "66%"
                          : passwordStrength === "Weak"
                          ? "33%"
                          : "0%",
                    }}
                  ></div>
                </div>
              </div>

              {/* Error and Recommendations */}
              {error && (
                <div className="error-section">
                  <p className="error-message">{error}</p>
                  {passwordRecommendations.length > 0 && (
                    <ul className="password-recommendations">
                      {passwordRecommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              <button type="submit">Register</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
