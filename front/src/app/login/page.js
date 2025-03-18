"use client"
import React, { useState } from 'react';
import axios from 'axios';


export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [registerForm, setRegisterForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };

  return (
      <div>
        <button
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLogin === false}>
          Register
        </button>
        <button
          onClick={() => setIsLogin(!isLogin)}
          disabled={isLogin === true}>
          Login
        </button>

        {isLogin ? (
          <div>
            <form onSubmit={}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className="bg-sky-50"
                  required />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="bg-sky-50"
                  required />
              </div>
              <button
                type="submit"
                className="border border-white">
                Create Account
              </button>
            </form>
          </div>
        ) : (
          <div>
          zooooooo
          </div>
        )}
      </div>
);}

// learning js sorry yusuf, all of the backend api calls require user authentication :d
