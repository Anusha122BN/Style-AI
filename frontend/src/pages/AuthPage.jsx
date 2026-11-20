import React, { useState } from 'react';
import { Sparkles, Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export const AuthPage = ({ initialTab = 'login', setActiveTab }) => {
  const { login, signup } = useAuth();
  
  const [tab, setTab] = useState(initialTab === 'signup' ? 'signup' : 'login'); // 'login' | 'signup' | 'forgot' | 'reset'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [genderPreference, setGenderPreference] = useState('Women');
  const [heightCm, setHeightCm] = useState(168);
  const [resetToken, setResetToken] = useState('');
  const [demoCode, setDemoCode] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      await login(trimmedEmail, password);
      setActiveTab('dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!trimmedEmail) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    try {
      const parsedHeight = parseFloat(heightCm);
      await signup({
        full_name: trimmedName,
        email: trimmedEmail,
        password,
        gender_preference: genderPreference || 'Women',
        height_cm: isNaN(parsedHeight) || parsedHeight <= 0 ? 168.0 : parsedHeight,
      });
      setActiveTab('dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSuccessMessage(res.message);
      if (res.demo_reset_code) {
        setDemoCode(res.demo_reset_code);
        setResetToken(res.demo_reset_code);
      }
      setTab('reset');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to request reset token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.resetPassword(email, resetToken, password);
      setSuccessMessage(res.message);
      setTab('login');
    } catch (err) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (role = 'women') => {
    if (role === 'women') {
      setEmail('elena.vance@styleai.com');
      setPassword('LuxuryFashion2026!');
      setFullName('Elena Vance');
      setGenderPreference('Women');
      setHeightCm(168);
    } else {
      setEmail('julian.ross@styleai.com');
      setPassword('LuxuryFashion2026!');
      setFullName('Julian Ross');
      setGenderPreference('Men');
      setHeightCm(180);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full glass-panel border border-[#D4AF37]/40 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#1C1A18] text-[#D4AF37] mx-auto flex items-center justify-center border border-[#D4AF37]/50 shadow-md">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-[#1A1715]">
            {tab === 'signup' && 'Create Your Style Profile'}
            {tab === 'login' && 'Welcome Back'}
            {tab === 'forgot' && 'Reset Your Password'}
            {tab === 'reset' && 'Enter New Password'}
          </h2>
          <p className="text-xs text-[#7A6E62]">
            {tab === 'signup' && 'Begin your journey with calibrated AI styling'}
            {tab === 'login' && 'Access your personalized recommendations'}
            {tab === 'forgot' && "We'll send a secure verification code"}
            {tab === 'reset' && 'Choose a strong password to protect your account'}
          </p>
        </div>

        {/* Tab Toggle (Login vs Sign Up) */}
        {(tab === 'login' || tab === 'signup') && (
          <div className="flex bg-[#EFEAE2] p-1 rounded-full border border-[#D4AF37]/30 text-xs">
            <button
              onClick={() => {
                setTab('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                tab === 'login' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setTab('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-full font-semibold transition-all ${
                tab === 'signup' ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-xs' : 'text-[#6E645A]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {successMessage}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <Mail className="w-4 h-4 text-[#A09385] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#3D3730]">Password</label>
                <button
                  type="button"
                  onClick={() => setTab('forgot')}
                  className="text-[11px] text-[#B8860B] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <Lock className="w-4 h-4 text-[#A09385] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#A09385] hover:text-[#1A1715]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 font-semibold text-xs tracking-wider uppercase shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* SIGNUP FORM */}
        {tab === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seraphina Vance"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <User className="w-4 h-4 text-[#A09385] absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seraphina@example.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <Mail className="w-4 h-4 text-[#A09385] absolute left-3 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3D3730] mb-1">Wardrobe Gender</label>
                <select
                  value={genderPreference}
                  onChange={(e) => setGenderPreference(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Women">Women</option>
                  <option value="Men">Men</option>
                  <option value="Prefer not to specify">Neutral</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3D3730] mb-1">Height (cm)</label>
                <input
                  type="number"
                  required
                  min="120"
                  max="230"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
                />
                <Lock className="w-4 h-4 text-[#A09385] absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#A09385] hover:text-[#1A1715]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/50 font-semibold text-xs tracking-wider uppercase shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? 'Creating Profile...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Your Registered Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#1C1A18] text-[#FAF8F5] font-semibold text-xs uppercase tracking-wider"
            >
              {loading ? 'Requesting...' : 'Generate Reset Code'}
            </button>
            <button
              type="button"
              onClick={() => setTab('login')}
              className="w-full text-center text-xs text-[#7A6E62] hover:text-[#1A1715]"
            >
              Back to Login
            </button>
          </form>
        )}

        {/* RESET PASSWORD FORM */}
        {tab === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-3.5">
            {demoCode && (
              <div className="p-3 bg-[#D4AF37]/15 rounded-xl text-xs text-[#6B5115] border border-[#D4AF37]/40">
                Generated Demo Code: <strong>{demoCode}</strong>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Reset Verification Code</label>
              <input
                type="text"
                required
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
                placeholder="e.g. 4F2A19B8"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs font-mono focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3D3730] mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2DDD5] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-[#1C1A18] text-[#FAF8F5] font-semibold text-xs uppercase tracking-wider"
            >
              {loading ? 'Updating Password...' : 'Save New Password'}
            </button>
          </form>
        )}

        {/* Demo Auto-fill Helper for Evaluators */}
        <div className="pt-4 border-t border-[#E8E2D8] text-center space-y-2">
          <p className="text-[11px] text-[#8C7A6B]">Quick Demo Credentials (One-Click Fill):</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo('women')}
              className="px-3 py-1 rounded-full bg-white border border-[#D4AF37]/40 text-[10px] font-semibold text-[#1A1715] hover:bg-[#FAF8F5]"
            >
              Fill Women Persona
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('men')}
              className="px-3 py-1 rounded-full bg-white border border-[#D4AF37]/40 text-[10px] font-semibold text-[#1A1715] hover:bg-[#FAF8F5]"
            >
              Fill Men Persona
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
