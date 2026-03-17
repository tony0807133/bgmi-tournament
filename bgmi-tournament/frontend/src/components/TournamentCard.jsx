import React from 'react';
import { Link } from 'react-router-dom';

const statusConfig = {
  upcoming: { color: 'bg-blue-500/15 text-blue-400 border-blue-500/25', dot: 'bg-blue-400' },
  ongoing: { color: 'bg-green-500/15 text-green-400 border-green-500/25', dot: 'bg-green-400 animate-pulse' },
  completed: { color: 'bg-gray-500/15 text-gray-400 border-gray-500/25', dot: 'bg-gray-400' },
  cancelled: { color: 'bg-red-500/15 text-red-400 border-red-500/25', dot: 'bg-red-400' },
};

const typeConfig = {
  solo: { icon: '🧍', label: 'SOLO', color: 'text-purple-400' },
  duo: { icon: '👥', label: 'DUO', color: 'text-blue-400' },
  squad: { icon: '⚔️', label: 'SQUAD', color: 'text-orange-400' },
};

export default function TournamentCard({ tournament }) {
  const { _id, title, type, entryFee, totalSlots, filledSlots, prizePool, scheduledAt, status, map, banner } = tournament;
  const progress = Math.round((filledSlots / totalSlots) * 100);
  const isFull = filledSlots >= totalSlots;
  const sConfig = statusConfig[status] || statusConfig.upcoming;
  const tConfig = typeConfig[type] || typeConfig.squad;
  const slotsLeft = totalSlots - filledSlots;

  return (
    <Link to={`/tournaments/${_id}`} className="card-hover group block overflow-hidden">
      {/* Banner */}
      <div className="h-40 rounded-xl overflow-hidden mb-4 relative">
        {banner ? (
          <img src={banner} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-red-500/10 to-purple-500/10 flex items-center justify-center">
            <span className="text-5xl opacity-60">🎮</span>
          </div>
        )}
        {/* Overlay badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <span className={`badge border ${sConfig.color} flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${sConfig.dot}`}></span>
            {status.toUpperCase()}
          </span>
          <span className="badge bg-black/60 text-white border border-white/10 backdrop-blur-sm">
            {tConfig.icon} {tConfig.label}
          </span>
        </div>
        {isFull && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm rounded-xl">
            <span className="text-red-400 font-black text-lg">FULL</span>
          </div>
        )}
      </div>

      {/* Content */}
      <h3 className="font-bold text-base mb-1 truncate group-hover:text-orange-400 transition-colors">{title}</h3>
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <span>🗺️ {map}</span>
        <span>•</span>
        <span>📅 {new Date(scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</span>
      </div>

      {/* Prize & Entry */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Entry Fee</p>
          <p className="font-black text-base text-orange-400">{entryFee === 0 ? 'FREE' : `₹${entryFee}`}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500 mb-0.5">Prize Pool</p>
          {entryFee > 0 ? (
            <div>
              <p className="font-black text-base text-green-400">₹{Math.round(entryFee * filledSlots * 0.8)}</p>
              <p className="text-[10px] text-gray-600">of ₹{prizePool} max</p>
            </div>
          ) : (
            <p className="font-black text-base text-green-400">₹{prizePool}</p>
          )}
        </div>
      </div>

      {/* Slot progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-500">{filledSlots}/{totalSlots} slots</span>
          <span className={slotsLeft <= 10 && !isFull ? 'text-red-400 font-semibold' : 'text-gray-500'}>
            {isFull ? 'Full' : `${slotsLeft} left`}
          </span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isFull ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-gradient-to-r from-orange-500 to-orange-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        {entryFee > 0 && (
          <div className="mt-2">
            <div className="flex justify-between text-[10px] text-gray-600 mb-1">
              <span>Prize growing</span>
              <span>₹{Math.round(entryFee * filledSlots * 0.8)} / ₹{prizePool}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
