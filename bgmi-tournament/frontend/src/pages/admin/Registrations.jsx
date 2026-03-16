import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminRegistrations() {
  const { id } = useParams();
  const [tournament, setTournament] = useState(null);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [t, r] = await Promise.all([
      axios.get(`/api/tournaments/${id}`),
      axios.get(`/api/registrations/tournament/${id}`)
    ]);
    setTournament(t.data);
    setRegs(r.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const updateResult = async (regId, kills, rank) => {
    try {
      await axios.put(`/api/registrations/${regId}/result`, { kills: Number(kills), rank: Number(rank) });
      toast.success('Result updated');
      fetchData();
    } catch {
      toast.error('Failed to update');
    }
  };

  const verifyScreenshot = async (regId, verified) => {
    try {
      await axios.put(`/api/registrations/${regId}/verify-screenshot`, { verified });
      toast.success(verified ? 'Screenshot verified ✅' : 'Screenshot rejected ✕');
      fetchData();
    } catch {
      toast.error('Failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Registrations</h1>
      {tournament && (
        <p className="text-gray-400 mb-6">{tournament.title} — {regs.length}/{tournament.totalSlots} slots filled</p>
      )}

      {/* Progress bar */}
      {tournament && (
        <div className="card mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>Slot Progress</span>
            <span>{regs.length}/{tournament.totalSlots}</span>
          </div>
          <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${Math.round((regs.length / tournament.totalSlots) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Screenshot summary */}
      {regs.some(r => r.winningScreenshot) && (
        <div className="card mb-6 border-yellow-500/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xl">📸</span>
            <div>
              <h3 className="font-bold text-sm">Screenshot Verification</h3>
              <p className="text-xs text-gray-500">
                {regs.filter(r => r.screenshotVerified).length} verified ·{' '}
                {regs.filter(r => r.winningScreenshot && !r.screenshotVerified).length} pending ·{' '}
                {regs.filter(r => !r.winningScreenshot).length} not uploaded
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {regs.filter(r => r.winningScreenshot).map(r => (
              <div key={r._id} className="relative">
                <a href={r.winningScreenshot} target="_blank" rel="noreferrer">
                  <img src={r.winningScreenshot} alt={r.teamName}
                    className="h-20 w-28 object-cover rounded-xl border border-white/10 hover:border-orange-500/40 transition-colors" />
                </a>
                <div className="absolute top-1 left-1 right-1 flex justify-between">
                  <span className="text-xs bg-black/70 text-white px-1.5 py-0.5 rounded-md truncate max-w-[70px]">{r.teamName}</span>
                  {r.screenshotVerified
                    ? <span className="text-xs bg-green-500/80 text-white px-1.5 py-0.5 rounded-md">✓</span>
                    : <span className="text-xs bg-yellow-500/80 text-black px-1.5 py-0.5 rounded-md font-bold">!</span>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-3 px-2">Slot</th>
              <th className="text-left py-3 px-2">Team & Players</th>
              <th className="text-left py-3 px-2">Payment</th>
              <th className="text-left py-3 px-2">Screenshot</th>
              <th className="text-left py-3 px-2">Kills</th>
              <th className="text-left py-3 px-2">Rank</th>
              <th className="text-left py-3 px-2">Prize</th>
              <th className="text-left py-3 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {regs.map(reg => (
              <RegRow key={reg._id} reg={reg} onUpdate={updateResult} onVerify={verifyScreenshot} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RegRow({ reg, onUpdate, onVerify }) {
  const [kills, setKills] = useState(reg.kills || 0);
  const [rank, setRank] = useState(reg.rank || 0);

  return (
    <tr className="border-b border-gray-800 hover:bg-dark-700/50">
      <td className="py-3 px-2 font-bold text-orange-500">#{reg.slotNumber}</td>
      <td className="py-3 px-2">
        <p className="font-medium text-white">{reg.teamName}</p>
        {/* Team leader */}
        <div className="mt-1.5 space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded font-bold shrink-0">Leader</span>
            <span className="text-xs text-gray-300">{reg.teamLeader?.bgmiName || reg.teamLeader?.name}</span>
            <span className="text-xs text-gray-600">#{reg.teamLeader?.bgmiId || '—'}</span>
          </div>
          {/* Other members */}
          {reg.members?.map((m, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded font-bold shrink-0">M{i + 1}</span>
              <span className="text-xs text-gray-300">{m.bgmiName || '—'}</span>
              <span className="text-xs text-gray-600">#{m.bgmiId || '—'}</span>
            </div>
          ))}
        </div>
      </td>
      <td className="py-3 px-2">
        <span className={`badge ${reg.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {reg.paymentStatus}
        </span>
      </td>
      <td className="py-3 px-2">
        {reg.winningScreenshot ? (
          <div className="flex flex-col gap-1.5">
            <a href={reg.winningScreenshot} target="_blank" rel="noreferrer">
              <img src={reg.winningScreenshot} alt="ss" className="h-14 w-20 object-cover rounded-lg border border-white/10 hover:border-orange-500/40 transition-colors" />
            </a>
            {reg.screenshotVerified ? (
              <span className="text-xs text-green-400 font-bold flex items-center gap-1">✅ Verified</span>
            ) : (
              <div className="flex gap-1">
                <button onClick={() => onVerify(reg._id, true)}
                  className="text-xs bg-green-500/20 text-green-400 hover:bg-green-500/30 px-2 py-0.5 rounded-lg transition-colors font-bold">
                  ✓ Verify
                </button>
                <button onClick={() => onVerify(reg._id, false)}
                  className="text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30 px-2 py-0.5 rounded-lg transition-colors font-bold">
                  ✕ Reject
                </button>
              </div>
            )}
          </div>
        ) : <span className="text-gray-600 text-xs">Not uploaded</span>}
      </td>
      <td className="py-3 px-2">
        <input type="number" min="0" value={kills} onChange={e => setKills(e.target.value)}
          className="w-16 bg-dark-700 border border-gray-700 rounded px-2 py-1 text-center text-sm" />
      </td>
      <td className="py-3 px-2">
        <input type="number" min="0" value={rank} onChange={e => setRank(e.target.value)}
          className="w-16 bg-dark-700 border border-gray-700 rounded px-2 py-1 text-center text-sm" />
      </td>
      <td className="py-3 px-2 text-green-400 font-bold">
        {reg.prizeAwarded > 0 ? `₹${reg.prizeAwarded}` : '—'}
      </td>
      <td className="py-3 px-2">
        <button onClick={() => onUpdate(reg._id, kills, rank)} className="btn-primary text-xs py-1 px-3">Save</button>
      </td>
    </tr>
  );
}
