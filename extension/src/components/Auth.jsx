import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true 
});

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const { data } = await API.post(endpoint, { email, password });
      onLoginSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col p-6">
      
      <h2 className="text-2xl font-semibold mb-2">
        {isLogin ? 'Welcome back' : 'Create an account'}
      </h2>
      <p className="text-gray-500 mb-6 text-sm">
        {isLogin ? 'Log in to continue your active recall' : 'Start retaining information forever'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="email" 
              placeholder="name@example.com" 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand placeholder-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm outline-none transition-all focus:border-brand focus:ring-1 focus:ring-brand placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="mt-4 bg-brand hover:bg-brand-dark border-none py-3 rounded-lg text-white font-semibold text-sm cursor-pointer transition-colors w-full flex justify-center items-center h-[44px]">
          {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? 'Log in' : 'Continue')}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-100 flex justify-center">
        <p className="text-sm text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <span className="text-brand font-semibold cursor-pointer hover:underline" onClick={() => { setIsLogin(!isLogin); setError(''); }}>
            {isLogin ? "Sign up" : "Log in"}
          </span>
        </p>
      </div>

    </div>
  );
}
