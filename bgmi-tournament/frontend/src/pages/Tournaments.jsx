import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TournamentCard from '../components/TournamentCard';

const types = ['', 'solo', 'duo', 'squad'];
const statuses = ['', 'upcoming', 'ongoing', 'completed'];

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filters, setFilters] = useState({ status: 'upcoming', type: '' });

  useEffect(() => {
    setLoading(true);
    setError(false);
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.type) params.set('type', filters.type);
    axios.get(`/api/tournaments?${params}`)
      .then(r => setTournaments(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-1">Tournaments</h1>
        <p className="text-gray-500 text-sm">Find and join your next match</p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          {statuses.map(s => (
            <button key={s} onClick={() => setFilters({ ...filters, status: s })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filters.status === s ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
          {types.map(t => (
            <button key={t} onClick={() => setFilters({ ...filters, type: t })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${filters.type === t ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:text-white'}`}>
              {t || 'All Modes'}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-gray-400 font-medium">Failed to load tournaments</p>
          <button onClick={() => setFilters(f => ({ ...f }))} className="btn-primary mt-4">Retry</button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-40 bg-white/5 rounded-xl mb-4" />
              <div className="h-4 bg-white/5 rounded mb-2 w-3/4" />
              <div className="h-3 bg-white/5 rounded mb-4 w-1/2" />
              <div className="h-1.5 bg-white/5 rounded" />
            </div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="card text-center py-20">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-400 font-medium">No tournaments found</p>
          <p className="text-gray-600 text-sm mt-1">Try changing the filters</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-sm mb-4">{tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map(t => <TournamentCard key={t._id} tournament={t} />)}
          </div>
        </>
      )}
    </div>
  );
}
