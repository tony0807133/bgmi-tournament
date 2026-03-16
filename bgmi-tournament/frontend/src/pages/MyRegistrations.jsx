import { useEffect, useState } from 'react';
import axios from 'axios';

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
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
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
          {regs.map(reg => (
            <div key={reg._id} className="card hover:border-white/10 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-bold text-lg">{reg.tournament?.title}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-gray-500 text-sm">Team: <span className="text-white font-medium">{reg.teamName}</span></span>
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-500 text-sm">Slot <span className="text-orange-400 font-bold">#{reg.slotNumber}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className={`badge border text-xs ${statusConfig[reg.paymentStatus]}`}>{reg.paymentStatus}</span>
                  <span className="badge bg-white/5 text-gray-400 text-xs uppercase">{reg.tournament?.type}</span>
                </div>
              </div>

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

              {reg.prizeAwarded > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <p className="text-green-400 font-black text-lg">₹{reg.prizeAwarded} Won!</p>
                    <p className="text-xs text-gray-500">Credited to your wallet</p>
                  </div>
                </div>
              )}

              {/* Match status info */}
              {reg.tournament?.status === 'ongoing' && (
                <div className="mt-3 bg-green-500/5 border border-green-500/20 rounded-xl p-3">
                  <p className="text-green-400 font-bold text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block"></span>
                    Match is Live — Check your email for room details
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
