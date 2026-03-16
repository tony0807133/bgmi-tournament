import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import TournamentCard from '../components/TournamentCard';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: '🏆', title: 'Compete & Win', desc: 'Solo, Duo & Squad tournaments with real cash prizes' },
  { icon: '⚡', title: 'Instant Payouts', desc: 'Prizes credited to your wallet instantly after match' },
  { icon: '🔒', title: 'Secure Payments', desc: 'Razorpay powered payments, fully encrypted' },
  { icon: '📧', title: 'Room Alerts', desc: 'Get room ID & password directly in your email' },
];

export default function Home() {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    axios.get('/api/tournaments?status=upcoming')
      .then(r => setTournaments(r.data.slice(0, 6)))
      .catch(() => {}); // fail silently — home page still renders
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 py-20">
        <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />

        {/* Floating badges */}
        <div className="absolute top-24 left-8 hidden lg:flex items-center gap-2 glass rounded-2xl px-4 py-2.5 animate-float">
          <span className="text-green-400 text-lg">💰</span>
          <div><p className="text-xs text-gray-400">Prize Pool</p><p className="text-sm font-bold text-white">₹50,000+</p></div>
        </div>
        <div className="absolute top-40 right-8 hidden lg:flex items-center gap-2 glass rounded-2xl px-4 py-2.5 animate-float" style={{ animationDelay: '2s' }}>
          <span className="text-orange-400 text-lg">🎮</span>
          <div><p className="text-xs text-gray-400">Active Players</p><p className="text-sm font-bold text-white">5,000+</p></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="flex justify-center mb-6">
            <img src="/logo.svg" alt="BGMI Arena" className="w-20 h-20 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.4))' }} />
          </div>

          {user ? (
            /* Logged-in greeting */
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-sm text-green-400 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              Welcome back, {user.name.split(' ')[0]}! 🎮
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 text-sm text-orange-400 font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              Live Tournaments Available
            </div>
          )}

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            <span className="text-white">Compete.</span>{' '}
            <span className="text-gradient">Win.</span>{' '}
            <span className="text-white">Dominate.</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            India's premier BGMI tournament platform. Join Solo, Duo & Squad matches and win real cash prizes every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/tournaments" className="btn-primary text-base px-8 py-3.5">
              Browse Tournaments
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            {user ? (
              <Link to="/wallet" className="btn-secondary text-base px-8 py-3.5">
                💰 My Wallet — ₹{user.wallet || 0}
              </Link>
            ) : (
              <Link to="/register" className="btn-secondary text-base px-8 py-3.5">
                Create Free Account
              </Link>
            )}
          </div>

          {/* Logged-in quick links */}
          {user && (
            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <Link to="/my-registrations" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                🎮 My Matches
              </Link>
              <Link to="/profile" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-white/10">
                👤 Profile
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5 bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20">
                  ⚙️ Admin Panel
                </Link>
              )}
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-14 flex-wrap">
            {[
              { value: '100+', label: 'Tournaments' },
              { value: '5K+', label: 'Players' },
              { value: '₹2L+', label: 'Distributed' },
              { value: '99%', label: 'Uptime' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-black text-white">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(f => (
            <div key={f.title} className="card text-center group hover:border-orange-500/30 transition-all duration-300">
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
              <h3 className="font-bold text-sm mb-1">{f.title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Upcoming tournaments */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black">Upcoming Tournaments</h2>
            <p className="text-gray-500 text-sm mt-1">Register before slots fill up</p>
          </div>
          <Link to="/tournaments" className="btn-secondary text-sm py-2 px-4">
            View All
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-5xl mb-4">🎮</div>
            <p className="text-gray-400 font-medium">No upcoming tournaments</p>
            <p className="text-gray-600 text-sm mt-1">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map(t => <TournamentCard key={t._id} tournament={t} />)}
          </div>
        )}
      </section>
    </div>
  );
}