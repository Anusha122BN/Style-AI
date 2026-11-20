import React, { useState } from 'react';
import { 
  Sparkles, 
  User, 
  Menu, 
  X, 
  LogOut, 
  ShieldCheck, 
  Compass, 
  Layers,
  ShoppingBag, 
  Palette, 
  Eye, 
  Sparkle,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'studio', label: 'Stylist Studio', icon: Sparkles },
    { id: 'fashion', label: 'Fashion Advisor', icon: Layers },
    { id: 'makeup', label: 'Makeup Advisor', icon: Sparkle },
    { id: 'palette', label: 'Color Palette', icon: Palette },
    { id: 'xai', label: 'Explainable AI', icon: Sliders },
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'feedback', label: 'Feedback', icon: ShieldCheck },
  ];

  return (
    <header className="no-print sticky top-0 z-50 glass-panel border-b border-[#E5C378]/30 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab(isAuthenticated ? 'dashboard' : 'landing')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1C1A18] via-[#2B2724] to-[#631B2A] flex items-center justify-center border border-[#D4AF37]/50 shadow-md group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] font-bold text-[#1A1715] group-hover:text-[#631B2A] transition-colors">
                Style AI
              </span>
              <span className="block text-[9px] uppercase tracking-[0.25em] text-[#8C7A6B] font-medium -mt-1">
                Explainable AI Stylist
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 ${
                      isActive
                        ? 'bg-[#1C1A18] text-[#FAF8F5] shadow-sm'
                        : 'text-[#4A4540] hover:text-[#1A1715] hover:bg-[#F0EBE4]/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D4AF37]' : 'text-[#8C7A6B]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* User & Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    activeTab === 'profile'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#1A1715]'
                      : 'border-[#E2DDD5] bg-white/70 text-[#4A4540] hover:border-[#D4AF37]/60'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center text-[10px] font-bold">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.full_name || 'Profile'}</span>
                </button>

                <button
                  onClick={logout}
                  title="Log Out"
                  className="p-2 rounded-full text-[#6E645A] hover:text-[#631B2A] hover:bg-[#F2ECE4] transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setActiveTab('auth-login')}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-[#1A1715] hover:bg-[#EFEAE2] transition-colors tracking-wider uppercase"
                >
                  Log In
                </button>
                <button
                  onClick={() => setActiveTab('auth-signup')}
                  className="px-5 py-2 rounded-full text-xs font-semibold bg-[#1C1A18] text-[#FAF8F5] hover:bg-[#2B2724] border border-[#D4AF37]/40 shadow-sm transition-all hover:scale-[1.02] tracking-wider uppercase"
                >
                  Join Style AI
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-[#1A1715] hover:bg-[#EFEAE2]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#E2DDD5] px-4 pt-2 pb-6 space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
          {isAuthenticated ? (
            <>
              <div className="px-3 py-2 border-b border-[#E2DDD5] mb-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-[#1C1A18] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#1A1715]">{user?.full_name}</p>
                    <p className="text-[10px] text-[#8C7A6B]">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-[#631B2A] flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>

              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      activeTab === item.id ? 'bg-[#1C1A18] text-white' : 'text-[#4A4540] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#D4AF37]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setActiveTab('profile');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#4A4540] hover:bg-[#F2ECE4]"
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>My Profile & Settings</span>
              </button>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  setActiveTab('auth-login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold border border-[#D4AF37] text-[#1A1715]"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setActiveTab('auth-signup');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold bg-[#1C1A18] text-white"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
