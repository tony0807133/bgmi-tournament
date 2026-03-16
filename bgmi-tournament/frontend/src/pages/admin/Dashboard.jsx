import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [recentTournaments, setRecentTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/tournaments/meta/analytics'),
      axios.get('/api/wallet/admin/withdrawals'),
      axios.get('/api/tournaments')
    ]).then(([a, w, t]) => {
      setAnalytics(a.data);
      setWithdrawals(w.data);
      setRecentTournaments(t.data.slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    </div>
  );

  const pending = withdrawals.filter(w => w.status === 'pending').length;
  const a = analytics || {};

  const statCards = [
    { label: 'Total Revenue', value: `₹${(a.totalRevenue || 0).toLocaleString()}`, icon: '💰', sub: 'Entry fees collected', color: 'from-green-500/20 to-green-500/5' },
    { label: 'Admin Profit', value: `₹${(a.adminProfit || 0).toLocaleString()}`, icon: '📈', sub: '20% of entries', color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'Prizes Distributed', value: `₹${(a.totalPrizeDistributed || 0).toLocaleString()}`, icon: '🏆', sub: 'Paid to winners', color: 'from-yellow-500/20 to-yellow-500/5' },
    { label: 'Total Deposits', value: `₹${(a.totalDeposits || 0).toLocaleString()}`, icon: '💳', sub: 'Wallet top-ups', color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Registered Users', value: a.totalUsers || 0, icon: '👥', sub: 'All time', link: '/admin/users', color: 'from-cyan-500/20 to-cyan-500/5' },
    { label: 'Total Registrations', value: a.totalRegistrations || 0, icon: '🎮', sub: `Avg ${a.avgPlayersPerTournament || 0}/tournament`, color: 'from-orange-500/20 to-orange-500/5' },
    { label: 'Pending Withdrawals', value: pending, icon: '💸', sub: pending > 0 ? 'Needs attention' : 'All clear', link: '/admin/withdrawals', color: pending > 0 ? 'from-red-500/20 to-red-500/5' : 'from-gray-500/20 to-gray-500/5', alert: pending > 0 },
    { label: 'Tournaments', value: a.totalTournaments || 0, icon: '🗂️', sub: `${a.upcomingTournaments || 0} upcoming · ${a.ongoingTournaments || 0} live`, link: '/admin/tournaments', color: 'from-indigo-500/20 to-indigo-500/5' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Analytics, tournaments & payouts</p>
        </div>
        <Link to="/admin/tournaments/new" className="btn-primary flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Tournament
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label} className={`card bg-gradient-to-br ${c.color} ${c.alert ? 'border-red-500/30' : ''} relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              {c.link && <Link to={c.link} className="text-xs text-gray-400 hover:text-orange-400 transition-colors">View →</Link>}
            </div>
            <p className={`text-2xl font-black mb-0.5 ${c.alert ? 'text-red-400' : 'text-white'}`}>{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Daily registrations chart (simple bar) */}
      {a.dailyRegistrations?.length > 0 && (
        <div className="card mb-8">
          <h2 className="font-bold mb-4 text-sm text-gray-400 uppercase tracking-wider">Registrations — Last 7 Days</h2>
          <div className="flex items-end gap-2 h-24">
            {a.dailyRegistrations.map(d => {
              const max = Math.max(...a.dailyRegistrations.map(x => x.count));
              const pct = max > 0 ? (d.count / max) * 100 : 0;
              return (
                <div key={d._id} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-gray-500">{d.count}</span>
                  <div className="w-full bg-orange-500/80 rounded-t-md transition-all" style={{ height: `${Math.max(4, pct)}%` }} />
                  <span className="text-[10px] text-gray-600">{d._id.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <h2 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Manage Tournaments', link: '/admin/tournaments', icon: '🏆', desc: 'Create, edit, manage' },
          { label: 'User Management', link: '/admin/users', icon: '👥', desc: 'View & manage users' },
          { label: 'Withdrawals', link: '/admin/withdrawals', icon: '💸', desc: `${pending} pending`, alert: pending > 0 },
          { label: 'New Tournament', link: '/admin/tournaments/new', icon: '➕', desc: 'Create a new match' },
        ].map(q => (
          <Link key={q.label} to={q.link}
            className={`card hover:border-orange-500/30 transition-all duration-200 group ${q.alert ? 'border-red-500/30' : ''}`}>
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{q.icon}</div>
            <p className="text-sm font-bold">{q.label}</p>
            <p className={`text-xs mt-0.5 ${q.alert ? 'text-red-400' : 'text-gray-500'}`}>{q.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent tournaments */}
      {recentTournaments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Tournaments</h2>
            <Link to="/admin/tournaments" className="text-xs text-orange-400 hover:underline">View all →</Link>
          </div>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Tournament', 'Mode', 'Slots', 'Status', 'Prize'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTournaments.map(t => (
                  <tr key={t._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="py-3 px-4 font-medium">{t.title}</td>
                    <td className="py-3 px-4 text-gray-400 uppercase text-xs">{t.type}</td>
                    <td className="py-3 px-4 text-gray-400">{t.filledSlots}/{t.totalSlots}</td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${
                        t.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400' :
                        t.status === 'ongoing' ? 'bg-green-500/15 text-green-400' :
                        t.status === 'completed' ? 'bg-gray-500/15 text-gray-400' :
                        'bg-red-500/15 text-red-400'
                      }`}>{t.status}</span>
                    </td>
                    <td className="py-3 px-4 text-green-400 font-bold">₹{t.prizePool}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
