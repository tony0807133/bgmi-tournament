import React, { useEffect, useState } from 'react';
import axios from 'axios';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('earnings');

  useEffect(() => {
    axios.get('/api/tournaments/meta/leaderboard')
      .then(r => setPlayers(r.data))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...players].sort((a, b) => {
    if (tab === 'earnings') return b.totalEarnings - a.totalEarnings;
    if (tab === 'wins') return b.totalWins - a.totalWins;
    return b.totalKills - a.totalKills;
  });

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black mb-2">🏆 Leaderboard</h1>
        <p className="text-gray-500 text-sm">Top players ranked by earnings, wins & kills</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-white/3 p-1 rounded-xl border border-white/5">
        {[
          { key: 'earnings', label: '💰 Earnings' },
          { key: 'wins', label: '🏆 Wins' },
          { key: 'kills', label: '💀 Kills' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {sorted.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-8">
          {[sorted[1], sorted[0], sorted[2]].map((p, i) => {
            const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
            const heights = ['h-24', 'h-32', 'h-20'];
            const colors = ['bg-gray-500/20 border-gray-500/30', 'bg-yellow-500/20 border-yellow-500/30', 'bg-orange-500/20 border-orange-500/30'];
            return (
              <div key={p._id} className={`flex-1 ${heights[i]} ${colors[i]} border rounded-2xl flex flex-col items-center justify-end pb-3 px-2`}>
                <span className="text-2xl mb-1">{medals[rank - 1]}</span>
                <p className="text-xs font-bold text-white truncate w-full text-center">{p.bgmiName || p.name}</p>
                <p className="text-xs text-gray-400">
                  {tab === 'earnings' ? `₹${p.totalEarnings}` : tab === 'wins' ? `${p.totalWins}W` : `${p.totalKills}K`}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {sorted.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-5xl mb-3">🎮</p>
          <p className="text-gray-400">No players on the leaderboard yet</p>
          <p className="text-gray-600 text-sm mt-1">Play tournaments and win prizes to appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((p, i) => (
            <div key={p._id} className={`card flex items-center gap-4 py-3.5 ${i < 3 ? 'border-orange-500/15' : ''}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                i === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                i === 1 ? 'bg-gray-400/20 text-gray-300' :
                i === 2 ? 'bg-orange-600/20 text-orange-400' :
                'bg-white/5 text-gray-500'
              }`}>
                {i < 3 ? medals[i] : `#${i + 1}`}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.bgmiName || p.name}</p>
                <p className="text-xs text-gray-500">#{p.bgmiId || '—'}</p>
              </div>
              <div className="flex gap-4 text-right shrink-0">
                <div>
                  <p className="text-xs text-gray-500">Earnings</p>
                  <p className="font-black text-green-400 text-sm">₹{p.totalEarnings}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Wins</p>
                  <p className="font-black text-yellow-400 text-sm">{p.totalWins}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Kills</p>
                  <p className="font-black text-red-400 text-sm">{p.totalKills}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
