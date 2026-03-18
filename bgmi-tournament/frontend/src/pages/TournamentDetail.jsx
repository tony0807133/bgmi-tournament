import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const memberCount = { solo: 0, duo: 1, squad: 3 };

export default function TournamentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ teamName: '', members: [] });
  const [isRegistered, setIsRegistered] = useState(false);
  const formRef = useRef(null);

  const fetchTournament = () => axios.get(`/api/tournaments/${id}`).then(r => setTournament(r.data));

  const checkRegistration = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(`/api/registrations/check/${id}`);
      setIsRegistered(data.registered);
    } catch {}
  };

  useEffect(() => {
    fetchTournament().finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    checkRegistration();
  }, [id, user]);

  // For solo tournaments, auto-set teamName to player's bgmiName
  useEffect(() => {
    if (tournament?.type === 'solo' && user?.bgmiName) {
      setForm(f => ({ ...f, teamName: user.bgmiName }));
    }
  }, [tournament?.type, user?.bgmiName]);

  const handleRegister = async (e) => {
      e.preventDefault();
      if (!user) return navigate('/login');

      if (form.members.length > 0) {
        const allIds = [user.bgmiId, ...form.members.map(m => m.bgmiId)].filter(Boolean).map(id => id.trim().toLowerCase());
        const unique = new Set(allIds);
        if (unique.size !== allIds.length) {
          toast.error('Duplicate BGMI IDs in your team — each player must be unique');
          return;
        }
      }

      setRegistering(true);
      try {
        const payload = { tournamentId: id, teamName: form.teamName, members: form.members };
        await axios.post('/api/registrations', payload);
        toast.success(tournament.entryFee === 0 ? 'Registered successfully! 🎮' : 'Registered! Entry fee deducted from wallet 🔥');
        setShowForm(false);
        setIsRegistered(true);
        await fetchTournament();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setRegistering(false);
      }
    };

  const updateMember = (i, field, val) => {
    const m = [...form.members];
    m[i] = { ...m[i], [field]: val };
    setForm({ ...form, members: m });
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
    </div>
  );
  if (!tournament) return (
    <div className="text-center py-32">
      <p className="text-gray-400">Tournament not found</p>
      <Link to="/tournaments" className="btn-primary mt-4">Back to Tournaments</Link>
    </div>
  );

  const progress = Math.round((tournament.filledSlots / tournament.totalSlots) * 100);
  const isFull = tournament.filledSlots >= tournament.totalSlots;
  const numMembers = memberCount[tournament.type];
  const slotsLeft = tournament.totalSlots - tournament.filledSlots;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back */}
      <Link to="/tournaments" className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Tournaments
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Banner */}
          <div className="h-56 rounded-2xl overflow-hidden relative">
            {tournament.banner ? (
              <img src={tournament.banner} alt={tournament.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-500/20 via-red-500/10 to-purple-500/10 flex items-center justify-center">
                <span className="text-7xl opacity-40">🎮</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="badge bg-black/60 text-white border border-white/10 backdrop-blur-sm text-xs">
                  {tournament.type.toUpperCase()}
                </span>
                <span className="badge bg-black/60 text-white border border-white/10 backdrop-blur-sm text-xs">
                  {tournament.map}
                </span>
              </div>
              <h1 className="text-2xl font-black text-white">{tournament.title}</h1>
            </div>
          </div>

          {/* Description */}
          {tournament.description && (
            <div className="card">
              <p className="text-gray-400 text-sm leading-relaxed">{tournament.description}</p>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Entry Fee', value: tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`, color: 'text-orange-400' },
              { label: 'Kill Prize', value: tournament.killPrize > 0 ? `₹${tournament.killPrize}/kill` : 'None', color: 'text-yellow-400' },
              { label: 'Schedule', value: new Date(tournament.scheduledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' }), color: 'text-blue-400' },
              { label: 'Total Slots', value: tournament.totalSlots, color: 'text-purple-400' },
            ].map(s => (
              <div key={s.label} className="card text-center py-4">
                <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                <p className={`font-black text-lg ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Prize Pool card */}
          <div className="card border-green-500/15">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm">💰 Prize Pool</h3>
              {tournament.entryFee > 0 && (
                <span className="text-xs text-gray-500">grows with registrations</span>
              )}
            </div>
            {tournament.entryFee > 0 ? (
              <>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Current</p>
                    <p className="text-3xl font-black text-green-400">₹{Math.round(tournament.entryFee * tournament.filledSlots * 0.8)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-0.5">Max (if full)</p>
                    <p className="text-xl font-black text-gray-400">₹{tournament.prizePool}</p>
                  </div>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{tournament.filledSlots} of {tournament.totalSlots} slots filled</p>
              </>
            ) : (
              <p className="text-3xl font-black text-green-400">₹{tournament.prizePool}</p>
            )}
          </div>

          {/* Slot progress */}
          <div className="card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">Registration Progress</h3>
              <span className={`text-sm font-bold ${isFull ? 'text-red-400' : slotsLeft <= 10 ? 'text-yellow-400' : 'text-gray-400'}`}>
                {isFull ? '🔴 FULL' : `${slotsLeft} slots left`}
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden mb-2">
              <div className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-red-500' : progress > 80 ? 'bg-yellow-500' : 'bg-gradient-to-r from-orange-500 to-orange-400'}`}
                style={{ width: `${progress}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{tournament.filledSlots} registered</span>
              <span>{progress}% filled</span>
              <span>{tournament.totalSlots} total</span>
            </div>
          </div>

          {/* Prizes */}
          {tournament.prizes?.length > 0 && (
            <div className="card">
              <h3 className="font-bold mb-4">🏆 Prize Distribution</h3>
              <div className="space-y-2">
                {tournament.prizes.map(p => (
                  <div key={p.rank} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.rank === 1 ? '🥇' : p.rank === 2 ? '🥈' : p.rank === 3 ? '🥉' : `#${p.rank}`}</span>
                      <span className="text-gray-300 text-sm">Rank {p.rank}</span>
                    </div>
                    <span className="font-black text-green-400">₹{p.amount}</span>
                  </div>
                ))}
                {tournament.killPrize > 0 && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">💀</span>
                      <span className="text-gray-300 text-sm">Per Kill Bonus</span>
                    </div>
                    <span className="font-black text-yellow-400">₹{tournament.killPrize}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Schedule card */}
          <div className="card">
            <h3 className="font-bold mb-3 text-sm text-gray-400 uppercase tracking-wider">Match Schedule</h3>
            <p className="font-bold text-white">{new Date(tournament.scheduledAt).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata' })}</p>
            <p className="text-orange-400 font-semibold mt-0.5">{new Date(tournament.scheduledAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' })}</p>
          </div>

          {/* Register CTA */}
          {tournament.status === 'upcoming' && (
            <div className="card border-orange-500/20">
              {!isFull ? (
                <>
                  <div className="text-center mb-4">
                    <p className="text-2xl font-black text-orange-400">{tournament.entryFee === 0 ? 'FREE' : `₹${tournament.entryFee}`}</p>
                    <p className="text-xs text-gray-500">entry fee</p>
                  </div>
                  {isRegistered ? (
                    <div className="text-center py-2">
                      <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 font-bold px-5 py-3 rounded-xl w-full justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Already Registered
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Check <a href="/my-registrations" className="text-orange-400 hover:underline">My Matches</a> for details</p>
                    </div>
                  ) : (
                    <>
                      {!user ? (
                        <Link to="/register" className="btn-primary w-full py-3 text-center block">
                          Register Now
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            const opening = !showForm;
                            setShowForm(opening);
                            if (opening) {
                              setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
                            }
                          }}
                          className="btn-primary w-full py-3"
                        >
                          {showForm ? 'Cancel' : 'Register Now'}
                        </button>
                      )}
                    </>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-red-400 font-bold text-lg">Tournament Full</p>
                  <p className="text-gray-500 text-xs mt-1">All slots are taken</p>
                </div>
              )}
            </div>
          )}

          {/* Registration form */}
          {showForm && !isRegistered && (
            <form ref={formRef} onSubmit={handleRegister} className="card border-orange-500/20 space-y-4">
              <h3 className="font-bold">{tournament.type === 'solo' ? 'Player Details' : 'Team Details'}</h3>

              {tournament.type === 'solo' ? (
                /* Solo — show player info, use bgmiName as teamName */
                <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                  <p className="text-xs text-gray-500 mb-1">Playing as</p>
                  <p className="text-base font-bold text-orange-400">{user?.bgmiName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">BGMI ID: {user?.bgmiId}</p>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Team Name</label>
                  <input className="input" placeholder="Enter team name" value={form.teamName}
                    onChange={e => setForm({ ...form, teamName: e.target.value })} required />
                </div>
              )}

              {numMembers > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
                    {tournament.type === 'duo' ? 'Partner (1)' : `Squad Members (${numMembers})`}
                  </label>
                  <div className="mb-2 p-3 bg-white/3 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 mb-1">You (Team Leader)</p>
                    <p className="text-sm font-medium text-orange-400">{user?.bgmiName} — {user?.bgmiId}</p>
                  </div>
                  {Array.from({ length: numMembers }).map((_, i) => (
                    <div key={i} className="space-y-2 mb-3 p-3 bg-white/3 rounded-xl border border-white/5">
                      <p className="text-xs text-gray-500">
                        {tournament.type === 'duo' ? 'Partner' : `Member ${i + 1}`}
                      </p>
                      <input className="input text-sm" placeholder="BGMI ID"
                        onChange={e => updateMember(i, 'bgmiId', e.target.value)} required />
                      <input className="input text-sm" placeholder="BGMI Name"
                        onChange={e => updateMember(i, 'bgmiName', e.target.value)} required />
                    </div>
                  ))}
                </div>
              )}

              {tournament.entryFee > 0 && user && (
                <div className="p-3 bg-white/3 rounded-xl border border-white/5">
                  <p className="text-sm font-medium">Pay from Wallet</p>
                  <p className="text-xs text-gray-500 mt-0.5">Balance: <span className="text-green-400 font-bold">₹{user.wallet || 0}</span> · Fee: <span className="text-orange-400 font-bold">₹{tournament.entryFee}</span></p>
                  {(user.wallet || 0) < tournament.entryFee && (
                    <p className="text-xs text-red-400 mt-1">Insufficient balance — <a href="/wallet" className="underline">add money to wallet</a> first</p>
                  )}
                </div>
              )}

              <button type="submit" className="btn-primary w-full py-3" disabled={registering || ((user?.wallet || 0) < tournament.entryFee && tournament.entryFee > 0)}>
                {registering ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Processing...
                  </span>
                ) : tournament.entryFee === 0 ? 'Confirm Registration' : `Pay ₹${tournament.entryFee} from Wallet`}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
