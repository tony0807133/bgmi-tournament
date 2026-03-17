import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const statusConfig = {
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  refunded: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
};

export default function MyRegistrations() {
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/registrations/my')
      .then(r => setRegs(r.data))
      .catch(() => toast.error('Failed to load registrations'))
      .finally(() => setLoading(false));
  }, []);

  const copy = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">My Registrations</h1>
        <p className="text-gray-500 text-sm mt-1">{regs.length} total registrations</p>
      </div>

      {regs.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🎮</div>
          <p className="text-gray-400 font-medium">No registrations yet</p>
          <p className="text-gray-600 text-sm mt-1">Join a tournament to get started</p>
          <a href="/tournaments" className="btn-primary mt-4 inline-flex">Browse Tournaments</a>
        </div>
      ) : (
        <div className="space-y-4">
          {regs.map(reg => {
            const t = reg.tournament;
            const isLive = t?.status === 'ongoing';
            const isCompleted = t?.status === 'completed';
            const roomAvailable = t?.roomSent && t?.roomId;

            return (
              <div key={reg._id} className={`card transition-all ${isLive ? 'border-green-500/20' : ''}`}>
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-bold text-lg">{t?.title || '—'}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-sm text-gray-500">
                      <span>Team: <span className="text-white font-medium">{reg.teamName}</span></span>
                      <span className="text-gray-600">•</span>
                      <span>Slot <span className="text-orange-400 font-bold">#{reg.slotNumber}</span></span>
                      {t?.scheduledAt && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span>📅 {new Date(t.scheduledAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={`badge border text-xs ${statusConfig[reg.paymentStatus]}`}>{reg.paymentStatus}</span>
                    <span className="badge bg-white/5 text-gray-400 text-xs uppercase">{t?.type}</span>
                    {isLive && (
                      <span className="badge bg-green-500/15 text-green-400 border-green-500/25 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />LIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Paid</p>
                    <p className="font-black text-orange-400">₹{reg.amountPaid}</p>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Rank</p>
                    <p className="font-black text-white">{reg.rank || '—'}</p>
                  </div>
                  <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">Kills</p>
                    <p className="font-black text-yellow-400">{reg.kills || '—'}</p>
                  </div>
                </div>

                {/* Room details — shown when admin has sent room */}
                {roomAvailable && reg.paymentStatus === 'paid' && (
                  <div className="bg-orange-500/5 border border-orange-500/25 rounded-xl p-4 mb-4">
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      Room Details — Match Starting Soon
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Room ID</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-white text-lg font-mono tracking-wider">{t.roomId}</p>
                          <button onClick={() => copy(t.roomId, 'Room ID')}
                            className="text-xs text-orange-400 hover:text-orange-300 shrink-0 bg-orange-500/10 px-2 py-1 rounded-lg">
                            Copy
                          </button>
                        </div>
                      </div>
                      <div className="bg-black/30 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">Password</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-black text-white text-lg font-mono tracking-wider">{t.roomPassword}</p>
                          <button onClick={() => copy(t.roomPassword, 'Password')}
                            className="text-xs text-orange-400 hover:text-orange-300 shrink-0 bg-orange-500/10 px-2 py-1 rounded-lg">
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Your slot: <span className="text-orange-400 font-bold">#{reg.slotNumber}</span></p>
                  </div>
                )}

                {/* Upcoming — waiting for room */}
                {t?.status === 'upcoming' && reg.paymentStatus === 'paid' && !roomAvailable && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3 mb-4">
                    <p className="text-blue-400 font-bold text-sm flex items-center gap-2">
                      <span>⏳</span> Waiting for room details
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Room ID & password will appear here once admin sends them</p>
                  </div>
                )}

                {/* Prize won */}
                {reg.prizeAwarded > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                    <span className="text-2xl">🏆</span>
                    <div>
                      <p className="text-green-400 font-black text-lg">₹{reg.prizeAwarded} Won!</p>
                      <p className="text-xs text-gray-500">Credited to your wallet</p>
                    </div>
                  </div>
                )}

                {/* Completed — no prize */}
                {isCompleted && !reg.prizeAwarded && reg.paymentStatus === 'paid' && (
                  <div className="bg-gray-500/5 border border-gray-500/20 rounded-xl p-3">
                    <p className="text-gray-400 text-sm">Match completed. Results will be updated by admin.</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
