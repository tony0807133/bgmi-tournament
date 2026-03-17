import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusConfig = {
  upcoming: 'bg-blue-500/15 text-blue-400',
  ongoing: 'bg-green-500/15 text-green-400',
  completed: 'bg-gray-500/15 text-gray-400',
  cancelled: 'bg-red-500/15 text-red-400'
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Room modal state
  const [roomModal, setRoomModal] = useState(null); // { id, title, roomId, roomPassword }
  const [sending, setSending] = useState(false);

  const fetchTournaments = () => {
    axios.get('/api/tournaments').then(r => {
      setTournaments(r.data);
    }).finally(() => setLoading(false));
  };

  useEffect(fetchTournaments, []);

  const openRoomModal = (t) => {
    setRoomModal({ id: t._id, title: t.title, roomId: t.roomId || '', roomPassword: t.roomPassword || '' });
  };

  const handleSendRoom = async () => {
    if (!roomModal.roomId.trim() || !roomModal.roomPassword.trim()) {
      toast.error('Enter both Room ID and Password');
      return;
    }
    setSending(true);
    try {
      // First save room ID + password to tournament
      await axios.put(`/api/tournaments/${roomModal.id}`, {
        roomId: roomModal.roomId.trim(),
        roomPassword: roomModal.roomPassword.trim()
      }, { timeout: 15000 });
      // Then send emails
      const { data } = await axios.post(`/api/tournaments/${roomModal.id}/send-room`, {}, { timeout: 30000 });
      toast.success(data.message);
      setRoomModal(null);
      fetchTournaments();
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        toast.error('Request timed out — Render may be waking up. Try again in 30 seconds.');
      } else {
        toast.error(err.response?.data?.message || 'Failed to send room');
      }
    } finally {
      setSending(false);
    }
  };

  const refundAll = async (id) => {
    if (!confirm('Cancel tournament and refund all registrations?')) return;
    try {
      const { data } = await axios.post(`/api/tournaments/${id}/refund-all`);
      toast.success(data.message);
      fetchTournaments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const distributePrizes = async (id) => {
    if (!confirm('Distribute prizes to all winners? This cannot be undone.')) return;
    try {
      const { data } = await axios.post(`/api/tournaments/${id}/distribute-prizes`);
      toast.success(data.message);
      fetchTournaments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const duplicate = async (id) => {
    try {
      await axios.post(`/api/tournaments/${id}/duplicate`);
      toast.success('Tournament duplicated!');
      fetchTournaments();
    } catch (err) {
      toast.error('Failed to duplicate');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Tournaments</h1>
          <p className="text-gray-500 text-sm mt-1">{tournaments.length} total</p>
        </div>
        <Link to="/admin/tournaments/new" className="btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Tournament
        </Link>
      </div>

      {tournaments.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-400 font-medium">No tournaments yet</p>
          <Link to="/admin/tournaments/new" className="btn-primary mt-4">Create First Tournament</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {tournaments.map(t => {
            const progress = Math.round((t.filledSlots / t.totalSlots) * 100);
            const hasRoom = t.roomId && t.roomId.trim() !== '';
            return (
              <div key={t._id} className="card hover:border-white/10 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base">{t.title}</h3>
                      <span className={`badge text-xs ${statusConfig[t.status]}`}>{t.status}</span>
                      <span className="badge bg-white/5 text-gray-400 text-xs uppercase">{t.type}</span>
                      {hasRoom && <span className="badge bg-green-500/10 text-green-400 text-xs">🔑 Room Set</span>}
                      {t.roomSent && <span className="badge bg-orange-500/10 text-orange-400 text-xs">📧 Sent</span>}
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                      <span>🗺️ {t.map}</span>
                      <span>💰 ₹{t.entryFee} entry</span>
                      <span>🏆 ₹{t.prizePool} pool</span>
                      <span>📅 {new Date(t.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[200px]">
                        <div className={`h-full rounded-full ${progress >= 100 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                          style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{t.filledSlots}/{t.totalSlots} slots</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Link to={`/admin/tournaments/${t._id}/registrations`} className="btn-secondary text-xs py-1.5 px-3">
                      📋 Registrations
                    </Link>
                    <Link to={`/admin/tournaments/${t._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">
                      Edit
                    </Link>
                    <button onClick={() => duplicate(t._id)} className="btn-secondary text-xs py-1.5 px-3">
                      📋 Clone
                    </button>
                    {(t.status === 'upcoming' || t.status === 'ongoing') && (
                      <>
                        <button onClick={() => openRoomModal(t)} className="btn-primary text-xs py-1.5 px-3">
                          📧 Send Room
                        </button>
                        {t.status === 'upcoming' && (
                          <button onClick={() => refundAll(t._id)} className="btn-danger text-xs py-1.5 px-3">
                            Refund & Cancel
                          </button>
                        )}
                      </>
                    )}
                    {(t.status === 'ongoing' || t.status === 'completed') && (
                      <button onClick={() => distributePrizes(t._id)} className="btn-success text-xs py-1.5 px-3">
                        🏆 Distribute Prizes
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Room Modal */}
      {roomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-black mb-1">📧 Send Room Details</h2>
            <p className="text-gray-500 text-sm mb-5">{roomModal.title}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Room ID</label>
                <input
                  className="input text-lg font-mono tracking-wider"
                  placeholder="e.g. 123456"
                  value={roomModal.roomId}
                  onChange={e => setRoomModal({ ...roomModal, roomId: e.target.value })}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Room Password</label>
                <input
                  className="input text-lg font-mono tracking-wider"
                  placeholder="e.g. bgmi123"
                  value={roomModal.roomPassword}
                  onChange={e => setRoomModal({ ...roomModal, roomPassword: e.target.value })}
                />
              </div>
            </div>

            <p className="text-xs text-gray-600 mt-3">
              This will save the room details and send an email to all paid registered players.
            </p>

            <div className="flex gap-3 mt-5">
              <button onClick={handleSendRoom} disabled={sending} className="btn-primary flex-1 py-2.5">
                {sending ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Sending...
                  </span>
                ) : '📧 Save & Send to All Players'}
              </button>
              <button onClick={() => setRoomModal(null)} className="btn-secondary px-5">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
