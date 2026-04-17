import React, { useState } from 'react';
import { Card, Button, Input } from '../components/common/UI';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAppAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAppAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) { setError('You must agree to our Terms.'); return; }
    setError('');
    setLoading(true);
    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await register({ 
        name: fullName, 
        email: form.email, 
        password: form.password,
        phone: form.phone 
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse">

      {/* ── Right Panel: Brand Image (desktop only) ────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-dark">
        <img
          src="/images/login_bg.png"
          alt="Premium Leather"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-110 animate-float"
          style={{ animationDirection: 'reverse' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full text-right items-end">
          <div>
            <Link to="/" className="text-4xl font-black italic tracking-tighter text-white uppercase">
              WEB<span className="text-primary">BAGS</span>
            </Link>
          </div>
          <div className="flex flex-col gap-6 max-w-md">
            <h2 className="text-6xl font-black uppercase tracking-tighter leading-none italic text-white">
              CRAFTING <br />
              IDENTITY
            </h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed">
              Join our community of artisans and luxury enthusiasts. Discover products that empower your journey.
            </p>
            <div className="h-1.5 w-24 bg-primary rounded-full ml-auto" />
          </div>
          <div className="text-[10px] font-black uppercase tracking-[5px] text-gray-500">
            Join the Legacy — Since 2026
          </div>
        </div>
      </div>

      {/* ── Left Panel: Form ──────────────────────────────── */}
      {/* ✅ Fixed: min-h-screen only on mobile, proper padding */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 md:p-8 bg-gray-50 min-h-screen lg:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          {/* ✅ Mobile: show logo at top of form */}
          <div className="flex lg:hidden justify-center mb-8">
            <Link to="/" className="text-3xl font-black italic tracking-tighter text-dark uppercase">
              WEB<span className="text-primary">BAGS</span>
            </Link>
          </div>

          <Card className="flex flex-col gap-6 shadow-2xl p-6 md:p-10 border-none rounded-3xl">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-black uppercase text-primary tracking-[5px]">Start Your Journey</span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-dark uppercase italic">
                Create Account
              </h1>
              <p className="text-sm text-muted font-medium uppercase tracking-widest mt-1">
                Sign up to get exclusive access
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* First + Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">First Name</label>
                  <div className="relative group">
                    <User
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                      size={16}
                    />
                    <Input
                      value={form.firstName}
                      onChange={update('firstName')}
                      placeholder="Yash"
                      className="pl-10 hover:border-primary/50"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Last Name</label>
                  <div className="relative group">
                    <User
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                      size={16}
                    />
                    <Input
                      value={form.lastName}
                      onChange={update('lastName')}
                      placeholder="Auti"
                      className="pl-10 hover:border-primary/50"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                      size={16}
                    />
                    <Input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      placeholder="anonymous@example.com"
                      className="pl-10 hover:border-primary/50"
                      required
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Phone Number</label>
                  <div className="relative group">
                    <Phone
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                      size={16}
                    />
                    <Input
                      type="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      placeholder="+91 9021055743"
                      className="pl-10 hover:border-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted ml-1">Password</label>
                <div className="relative group">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
                    size={16}
                  />
                  <Input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={update('password')}
                    placeholder="••••••••"
                    className="pl-10 pr-12 hover:border-primary/50"
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

              {/* Terms */}
              <div className="flex items-center gap-3 ml-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <label htmlFor="terms" className="text-[10px] font-black uppercase tracking-widest text-muted cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-primary hover:underline">Terms & Conditions</Link>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-4 text-sm font-black uppercase flex items-center justify-center gap-3 shadow-xl shadow-primary/20 mt-1"
              >
                {loading
                  ? 'CREATING ACCOUNT...'
                  : <><span>SIGN UP NOW</span><ArrowRight size={18} /></>
                }
              </Button>
            </form>

            <div className="text-center pt-1">
              <p className="text-sm text-muted font-medium uppercase tracking-tight">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-black hover:underline ml-1">
                  Log in here
                </Link>
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
