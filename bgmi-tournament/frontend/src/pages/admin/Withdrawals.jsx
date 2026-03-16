import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchData = () => {
    axios.get('/api/wallet/admin/withdrawals').then(r => setWithdrawals(r.data)).finally(() => setLoading(false));
  };

  useEffect(fetchData, []);

  const handleAction = async (id, status) => {
    let note = '';
    if (status === 'rejected') {
      note = prompt('Rejection reason (optional):') || '';
    }
    try {
      await axios.put(`/api/wallet/admin/withdrawals/${id}`, { status, adminNote: note });
      toast.success(`Withdrawal ${status}`);
      fetchData();
    } catch {
      toast.error('Action failed');
    }
  };

  const filtered = withdrawals.filter(w => filter === 'all' || w.status === filter);
  const counts = { pending: withdrawals.filter(w => w.status === 'pending').length, approved: withdrawals.filter(w => w.status === 'approved').length, rejected: withdrawals.filter(w => w.status === 'rejected').length };

  const statusConfig = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Withdrawal Requests</h1>
        <p className="text-gray-500 text-sm mt-1">{counts.pending} pending approval</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Pending', count: counts.pending, color: 'text-yellow-400', bg: 'from-yellow-500/10' },
          { label: 'Approved', count: counts.approved, color: 'text-green-400', bg: 'from-green-500/10' },
          { label: 'Rejected', count: counts.rejected, color: 'text-red-400', bg: 'from-red-500/10' },
        ].map(s => (
          <div key={s.label} className={`card bg-gradient-to-br ${s.bg} to-transparent text-center py-4`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`tab-btn capitalize ${filter === s ? 'tab-active' : 'tab-inactive'}`}>
            {s} {s !== 'all' && counts[s] > 0 && <span className="ml-1 text-xs opacity-70">({counts[s]})</span>}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-16">
            <p className="text-gray-500">No {filter === 'all' ? '' : filter} withdrawals</p>
          </div>
        ) : filtered.map(w => (
          <div key={w._id} className="card hover:border-white/10 transition-all">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <span className="text-orange-400 font-black text-sm">₹</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-black text-xl">₹{w.amount}</p>
                    <span className={`badge border text-xs ${statusConfig[w.status]}`}>{w.status}</span>
                  </div>
                  <p className="text-sm text-gray-300 font-medium">{w.user?.name}</p>
                  <p className="text-xs text-gray-500">{w.user?.email} • {w.user?.phone}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">UPI: {w.upiId}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{new Date(w.createdAt).toLocaleString('en-IN')}</p>
                  {w.adminNote && <p className="text-xs text-gray-400 mt-1 bg-white/3 rounded px-2 py-0.5">Note: {w.adminNote}</p>}
                </div>
              </div>
              {w.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleAction(w._id, 'approved')} className="btn-success text-sm py-2 px-4">
                    ✓ Approve
                  </button>
                  <button onClick={() => handleAction(w._id, 'rejected')} className="btn-danger text-sm py-2 px-4">
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
