import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { DumbbellIcon, GoogleIcon } from './common/Icons';
import Spinner from './common/Spinner';

const AuthPage: React.FC = () => {
  const { loginWithGoogle, signIn, signUp, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    const action = isLogin ? signIn : signUp;
    const result = await action(email, password);
    if (result.error) {
      setError(result.error);
    }
    // On success, the AuthContext will trigger a re-render
    setIsLoading(false);
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      if (result.error) {
         setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4 space-x-3 text-white">
            <DumbbellIcon className="w-10 h-10 text-indigo-400" />
            <h1 className="text-3xl font-bold tracking-tight">FitTrack AI</h1>
          </div>
          <h2 className="text-2xl font-semibold text-white">
            {isLogin ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p className="text-gray-300 mt-2 text-sm">
            {isLogin ? 'Sign in to continue your journey' : 'Get started with your AI fitness partner'}
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleAuthAction}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:bg-indigo-500/50 disabled:cursor-not-allowed transition"
          >
            {isLoading ? <Spinner /> : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>
        </form>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        <div className="flex items-center justify-center space-x-2">
          <span className="h-px bg-white/20 w-full"></span>
          <span className="text-gray-400 text-sm font-semibold">OR</span>
          <span className="h-px bg-white/20 w-full"></span>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={isLoading || loading}
          className="w-full flex items-center justify-center py-3 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isLoading ? <Spinner /> : <><GoogleIcon className="w-5 h-5 mr-3" /> Continue with Google</>}
        </button>

        <p className="text-sm text-center text-gray-300">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-400 hover:text-indigo-300 transition">
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
