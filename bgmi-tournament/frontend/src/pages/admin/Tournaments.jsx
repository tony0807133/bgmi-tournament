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
  const [screenshotCounts, setScreenshotCounts] = useState({});

  const fetchTournaments = () => {
    axios.get('/api/tournaments').then(r => {
      setTournaments(r.data);
      // Fetch pending screenshot counts for ongoing/completed tournaments
      r.data.filter(t => t.status === 'ongoing' || t.status === 'completed').forEach(t => {
        axios.get(`/api/registrations/tournament/${t._id}`).then(res => {
          const pending = res.data.filter(r => r.winningScreenshot && !r.screenshotVerified).length;
          setScreenshotCounts(prev => ({ ...prev, [t._id]: pending }));
        }).catch(() => {});
      });
    }).finally(() => setLoading(false));
  };

  useEffect(fetchTournaments, []);

  const sendRoom = async (id, title) => {
    try {
      const { data } = await axios.post(`/api/tournaments/${id}/send-room`);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed — set room ID & password first');
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
      const { data } = await axios.post(`/api/tournaments/${id}/duplicate`);
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
            return (
              <div key={t._id} className="card hover:border-white/10 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-base">{t.title}</h3>
                      <span className={`badge text-xs ${statusConfig[t.status]}`}>{t.status}</span>
                      <span className="badge bg-white/5 text-gray-400 text-xs uppercase">{t.type}</span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                      <span>🗺️ {t.map}</span>
                      <span>💰 ₹{t.entryFee} entry</span>
                      <span>🏆 ₹{t.prizePool} pool</span>
                      <span>📅 {new Date(t.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {/* Slot progress */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[200px]">
                        <div className={`h-full rounded-full ${progress >= 100 ? 'bg-red-500' : progress > 75 ? 'bg-yellow-500' : 'bg-orange-500'}`}
                          style={{ width: `${progress}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{t.filledSlots}/{t.totalSlots} slots</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <Link to={`/admin/tournaments/${t._id}/registrations`} className="btn-secondary text-xs py-1.5 px-3 relative">
                      📸 Registrations
                      {screenshotCounts[t._id] > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-yellow-400 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                          {screenshotCounts[t._id]}
                        </span>
                      )}
                    </Link>
                    <Link to={`/admin/tournaments/${t._id}/edit`} className="btn-secondary text-xs py-1.5 px-3">
                      Edit
                    </Link>
                    <button onClick={() => duplicate(t._id)} className="btn-secondary text-xs py-1.5 px-3" title="Clone this tournament">
                      📋 Clone
                    </button>
                    {t.status === 'upcoming' && (
                      <>
                        <button onClick={() => sendRoom(t._id, t.title)} className="btn-primary text-xs py-1.5 px-3">
                          📧 Send Room
                        </button>
                        <button onClick={() => refundAll(t._id)} className="btn-danger text-xs py-1.5 px-3">
                          Refund & Cancel
                        </button>
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
    </div>
  );
}
