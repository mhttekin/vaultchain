"use client"
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; 
import { useRouter } from 'next/navigation';

export default function Auth() {
  const router = useRouter();
  const { register, login, user, loading } = useAuth();
  
  
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  
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

  const handleRegisterChange = (e) => {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  };

  const handleLoginChange = (e) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  };


  // these const come handy in design
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('')
    const response = await login(loginForm.email, loginForm.password);
    if (response.success) {
      router.push('/')
    }else{
      setError(response.error);
    }
    setIsLoading(false);
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log(registerForm);
    const response = await register(registerForm.email, registerForm.password, registerForm.first_name, registerForm.last_name);
    if (response.success) {
      router.push('/')
    }else{
      setError(response.error);
    }
    setIsLoading(false);
  }
  if (loading) {
    return <div>Loading..</div>
  }
  if (user) {
    return null;
  }

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
            <form onSubmit={handleLoginSubmit}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  className="bg-sky-50 text-black"
                  required />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  className="bg-sky-50 text-black"
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
            <form onSubmit={handleRegisterSubmit}>
              <div>
                <label>First Name</label>
                <input
                  type="first_name"
                  name="first_name"
                  value={registerForm.first_name}
                  onChange={handleRegisterChange}
                  className="bg-sky-50 text-black"
                  required />
              </div>
              <div>
                <label>Last Name</label>
                <input
                  type="last_name"
                  name="last_name"
                  value={registerForm.last_name}
                  onChange={handleRegisterChange}
                  className="bg-sky-50 text-black"
                  required />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  className="bg-sky-50 text-black"
                  required />
              </div>
              <div>
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={handleRegisterChange}
                  className="bg-sky-50 text-black"
                  required />
              </div>
              <button
                type="submit"
                className="border border-white">
                Create Account
              </button>
            </form>
          </div>
        )}
      </div>
);}

// learning js sorry yusuf, all of the backend api calls require user authentication :d
