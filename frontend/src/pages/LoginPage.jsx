import React, { useState } from 'react';
import { Card, Button, Input } from '../components/common/UI';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAppAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      console.log(err)
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* ── Left Panel: Brand Image (desktop only) ─────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark">
        <img
          src="/images/login_bg.png"
          alt="Premium Leather"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 animate-float"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full">
          <div>
            <Link to="/" className="text-4xl font-black  tracking-tighter text-white uppercase">
              WEB<span className="text-primary">BAGS</span>
            </Link>
          </div>
          <div className="flex flex-col gap-6 max-w-md">
            <h2 className="text-6xl font-black uppercase tracking-tighter leading-none  text-white">
              Signature <br />
              Performance
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Step into the world of luxury. Sign in to access your curated collection and exclusive member benefits.
            </p>
            <div className="h-1.5 w-24 bg-primary rounded-full" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[5px] text-gray-500">
            Est. 2026 — Handcrafted Quality
          </div>
        </div>
      </div>

      {/* ── Right Panel: Form ──────────────────────────────── */}
      {/* ✅ Fixed: min-h-screen only on mobile, proper centering */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:p-8 bg-gray-50 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* ✅ Mobile: show logo at top of form */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="text-3xl font-black  tracking-tighter text-dark uppercase">
              WEB<span className="text-primary">BAGS</span>
            </Link>
          </div>

          <Card className="flex flex-col gap-6 shadow-2xl p-6 md:p-10 border-none rounded-3xl">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase text-primary tracking-[5px]">Welcome Back</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-dark uppercase ">Sign In</h1>
              <p className="text-sm text-muted font-medium uppercase tracking-widest mt-1">
                Enter your credentials below
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                    size={16}
                  />
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 pr-4 hover:border-primary/50"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                  >
                    Forgot your password?
                  </Link>

                </div>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                    size={16}
                  />
                  <Input
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-12 hover:border-primary/50"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-black uppercase flex items-center justify-center gap-3 shadow-xl shadow-primary/20 mt-1"
              >
                {loading
                  ? 'SIGNING IN...'
                  : <><span>SIGN IN</span><ArrowRight size={18} /></>
                }
              </Button>
            </form>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-[9px] font-black uppercase text-gray-300 tracking-[3px]">Quick Pulse</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                
              
              </div>
            </div>

            <div className="text-center pt-1">
              <p className="text-sm text-muted font-medium uppercase tracking-tight">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary font-black hover:underline ml-1">
                  Join the family
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
