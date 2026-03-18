import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [processing, setProcessing] = useState(null);
  const [noteMap, setNoteMap] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);

  const fetchDeposits = async () => {
    try {
      const { data } = await axios.get('/api/wallet/admin/deposits');
      setDeposits(data);
    } catch {
      toast.error('Failed to load deposits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleAction = async (id, status) => {
    setProcessing(id + status);
    try {
      await axios.put(`/api/wallet/admin/deposits/${id}`, { status, adminNote: noteMap[id] || '' });
      toast.success(status === 'approved' ? 'Deposit approved — wallet credited!' : 'Deposit rejected');
      fetchDeposits();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(null);
    }
  };

  const filtered = deposits.filter(d => filter === 'all' || d.status === filter);
  const pendingCount = deposits.filter(d => d.status === 'pending').length;

  const statusBadge = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  if (loading) return <div className="flex justify-center items-center py-32"><div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black">Deposit Requests</h1>
          <p className="text-gray-500 text-sm mt-1">Review and approve manual UPI deposits</p>
        </div>
        {pendingCount > 0 && (
          <span className="bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-xl text-sm font-bold">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {[['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']].map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
              filter === k ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
            }`}>{l}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-500">No {filter} deposits</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(d => (
            <div key={d._id} className="card">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <p className="font-black text-xl text-green-400">+₹{d.amount}</p>
                    <span className={`badge border text-xs ${statusBadge[d.status]}`}>{d.status}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{d.user?.name}</p>
                  <p className="text-xs text-gray-400">{d.user?.email}</p>
                  {d.user?.phone && <p className="text-xs text-gray-500">{d.user.phone}</p>}
                  {d.utrNumber && <p className="text-xs text-gray-400 mt-1">UTR: <span className="font-mono text-orange-400">{d.utrNumber}</span></p>}
                  <p className="text-xs text-gray-600 mt-1">{new Date(d.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true })}</p>
                  {d.adminNote && <p className="text-xs text-gray-400 mt-1 bg-white/3 rounded-lg px-2 py-1">Note: {d.adminNote}</p>}
                </div>

                {d.screenshotUrl && (
                  <button onClick={() => setPreviewUrl(d.screenshotUrl)} className="shrink-0">
                    <img src={d.screenshotUrl} alt="screenshot" className="w-20 h-20 object-cover rounded-xl border border-white/10 hover:border-orange-500/50 transition-colors" />
                  </button>
                )}
              </div>

              {d.status === 'pending' && (
                <div className="mt-4 space-y-2">
                  <input
                    className="input text-sm"
                    placeholder="Admin note (optional)"
                    value={noteMap[d._id] || ''}
                    onChange={e => setNoteMap(m => ({ ...m, [d._id]: e.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(d._id, 'approved')}
                      disabled={!!processing}
                      className="flex-1 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 font-bold text-sm hover:bg-green-500/25 transition-colors disabled:opacity-50"
                    >
                      {processing === d._id + 'approved' ? 'Approving...' : '✓ Approve & Credit Wallet'}
                    </button>
                    <button
                      onClick={() => handleAction(d._id, 'rejected')}
                      disabled={!!processing}
                      className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-sm hover:bg-red-500/25 transition-colors disabled:opacity-50"
                    >
                      {processing === d._id + 'rejected' ? 'Rejecting...' : '✗ Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Screenshot lightbox */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={previewUrl} alt="Payment screenshot" className="w-full rounded-2xl" />
            <button onClick={() => setPreviewUrl(null)} className="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}
