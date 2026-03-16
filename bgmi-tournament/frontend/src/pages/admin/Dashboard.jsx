import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ tournaments: [], users: [], withdrawals: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/tournaments'),
      axios.get('/api/users'),
      axios.get('/api/wallet/admin/withdrawals')
    ]).then(([t, u, w]) => setStats({ tournaments: t.data, users: u.data, withdrawals: w.data }))
      .finally(() => setLoading(false));
  }, []);

  const pending = stats.withdrawals.filter(w => w.status === 'pending').length;
  const totalPrizePool = stats.tournaments.reduce((a, t) => a + (t.prizePool || 0), 0);
  const totalProfit = stats.tournaments.reduce((a, t) => a + (t.adminProfit || 0), 0);
  const upcoming = stats.tournaments.filter(t => t.status === 'upcoming').length;

  const statCards = [
    { label: 'Total Tournaments', value: stats.tournaments.length, icon: '🏆', sub: `${upcoming} upcoming`, link: '/admin/tournaments', color: 'from-orange-500/20 to-orange-500/5' },
    { label: 'Registered Users', value: stats.users.length, icon: '👥', sub: 'All time', link: '/admin/users', color: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Pending Withdrawals', value: pending, icon: '💸', sub: pending > 0 ? 'Needs attention' : 'All clear', link: '/admin/withdrawals', color: pending > 0 ? 'from-yellow-500/20 to-yellow-500/5' : 'from-green-500/20 to-green-500/5', alert: pending > 0 },
    { label: 'Total Prize Pool', value: `₹${totalPrizePool.toLocaleString()}`, icon: '💰', sub: '80% of entries', link: null, color: 'from-green-500/20 to-green-500/5' },
    { label: 'Admin Profit', value: `₹${totalProfit.toLocaleString()}`, icon: '📈', sub: '20% of entries', link: null, color: 'from-purple-500/20 to-purple-500/5' },
    { label: 'Total Registrations', value: stats.withdrawals.length, icon: '🎮', sub: 'Withdrawal requests', link: '/admin/withdrawals', color: 'from-red-500/20 to-red-500/5' },
  ];

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tournaments, users & payouts</p>
        </div>
        <Link to="/admin/tournaments/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Tournament
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(c => (
          <div key={c.label} className={`card bg-gradient-to-br ${c.color} ${c.alert ? 'border-yellow-500/30' : ''} relative overflow-hidden`}>
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{c.icon}</span>
              {c.link && (
                <Link to={c.link} className="text-xs text-gray-400 hover:text-orange-400 transition-colors">View →</Link>
              )}
            </div>
            <p className={`text-2xl font-black mb-0.5 ${c.alert ? 'text-yellow-400' : 'text-white'}`}>{c.value}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-xs text-gray-600 mt-0.5">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Tournaments', link: '/admin/tournaments', icon: '🏆', desc: 'Create, edit, manage' },
          { label: 'User Management', link: '/admin/users', icon: '👥', desc: 'View & manage users' },
          { label: 'Withdrawals', link: '/admin/withdrawals', icon: '💸', desc: `${pending} pending`, alert: pending > 0 },
          { label: 'New Tournament', link: '/admin/tournaments/new', icon: '➕', desc: 'Create a new match' },
        ].map(q => (
          <Link key={q.label} to={q.link}
            className={`card hover:border-orange-500/30 transition-all duration-200 group ${q.alert ? 'border-yellow-500/30' : ''}`}>
            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">{q.icon}</div>
            <p className="text-sm font-bold">{q.label}</p>
            <p className={`text-xs mt-0.5 ${q.alert ? 'text-yellow-400' : 'text-gray-500'}`}>{q.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent tournaments */}
      {stats.tournaments.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold">Recent Tournaments</h2>
            <Link to="/admin/tournaments" className="text-xs text-orange-400 hover:underline">View all →</Link>
          </div>
          <div className="card overflow-hidden p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">Tournament</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">Mode</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">Slots</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 font-semibold uppercase tracking-wider">Prize</th>
                </tr>
              </thead>
              <tbody>
                {stats.tournaments.slice(0, 5).map(t => (
                  <tr key={t._id} className="table-row">
                    <td className="py-3 px-4 font-medium">{t.title}</td>
                    <td className="py-3 px-4 text-gray-400 uppercase text-xs">{t.type}</td>
                    <td className="py-3 px-4 text-gray-400">{t.filledSlots}/{t.totalSlots}</td>
                    <td className="py-3 px-4">
                      <span className={`badge text-xs ${t.status === 'upcoming' ? 'bg-blue-500/15 text-blue-400' : t.status === 'ongoing' ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                        {t.status}
                      </span>
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
