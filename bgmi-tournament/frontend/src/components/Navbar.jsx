import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); setDropdown(false); };
  const isActive = (path) => location.pathname === path;

  const navLink = (to, label) => (
    <Link to={to} onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors ${isActive(to) ? 'text-orange-400' : 'text-gray-400 hover:text-white'}`}>
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-[100] border-b border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo.svg" alt="BGMI Arena" className="w-9 h-9 drop-shadow-lg" />
          <span className="font-black text-lg tracking-tight">
            <span className="text-orange-400">BGMI</span>
            <span className="text-white"> Arena</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/tournaments', 'Tournaments')}
          {navLink('/leaderboard', '🏆 Leaderboard')}
          {user && navLink('/my-registrations', 'My Matches')}
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              Admin
            </Link>
          )}
          <Link to="/download" className="hidden md:flex items-center gap-1.5 text-xs font-bold bg-orange-500/10 border border-orange-500/25 text-orange-400 hover:bg-orange-500/20 px-3 py-1.5 rounded-xl transition-all">
            📲 Get App
          </Link>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/wallet" className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all">
                <span className="text-green-400">₹</span>
                <span>{user.wallet || 0}</span>
              </Link>
              <div className="relative" ref={dropRef}>
                <button onClick={() => setDropdown(!dropdown)}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 transition-all">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                  <svg className={`w-3 h-3 text-gray-400 transition-transform ${dropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl py-1 overflow-hidden border border-white/10" style={{ background: '#111118', zIndex: 9999 }}>
                    <Link to="/profile" onClick={() => setDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <span>👤</span> Profile
                    </Link>
                    <Link to="/wallet" onClick={() => setDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <span>💰</span> Wallet
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setDropdown(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-white/5 transition-colors">
                        <span>⚙️</span> Admin Panel
                      </Link>
                    )}
                    <div className="border-t border-white/5 mt-1 pt-1">
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors">
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-gray-400 hover:text-white p-1" onClick={() => setOpen(!open)}>
          {open
            ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          }
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] bg-[#0a0a0f]/95 px-4 py-4 flex flex-col gap-3">
          {navLink('/tournaments', '🏆 Tournaments')}
          {navLink('/leaderboard', '🥇 Leaderboard')}
          {user && navLink('/my-registrations', '🎮 My Matches')}
          {user && navLink('/wallet', `💰 Wallet ₹${user.wallet || 0}`)}
          {user && navLink('/profile', '👤 Profile')}
          {user?.role === 'admin' && navLink('/admin', '⚙️ Admin Panel')}
          {navLink('/download', '📲 Get App')}
          {user
            ? <button onClick={handleLogout} className="text-left text-sm text-red-400">🚪 Logout</button>
            : <div className="flex gap-2 pt-2">
                <Link to="/login" className="btn-secondary text-sm flex-1" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary text-sm flex-1" onClick={() => setOpen(false)}>Sign Up</Link>
              </div>
          }
        </div>
      )}
    </nav>
  );
}
