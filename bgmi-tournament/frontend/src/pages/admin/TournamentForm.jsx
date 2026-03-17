import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

// Distribution from 80% prize pool:
// 1st=40%, 2nd=20%, 3rd=15%, kills=5%  → total=80% ✓
const KILL_BUDGET_RATIO = 0.05;
const RANK_SPLITS = [0.40, 0.20, 0.15];
const AVG_KILLS_TOP3 = 24;

function round2(n) { return Math.round(n * 100) / 100; }

// For paid: prizePool = entryFee × slots × 0.8
// For free: prizePool = sponsoredPool (admin sets it manually)
function calcAuto(entryFee, totalSlots, numRanks = 3, sponsoredPool = 0) {
  const isFree = Number(entryFee) === 0;
  const total = isFree ? 0 : Number(entryFee) * Number(totalSlots);
  const adminProfit = isFree ? 0 : Math.round(total * 0.2);
  const prizePool = isFree ? Number(sponsoredPool) : (total - adminProfit);

  const killBudget = round2(prizePool * KILL_BUDGET_RATIO);
  const killPrize = prizePool > 0 ? round2(killBudget / AVG_KILLS_TOP3) : 0;

  const splits = RANK_SPLITS.slice(0, numRanks);
  const prizes = splits.map((ratio, i) => ({
    rank: i + 1,
    amount: Math.round(prizePool * ratio)
  }));

  return { total, adminProfit, prizePool, killBudget, killPrize, prizes, isFree };
}

const defaultForm = {
  title: '', description: '', type: 'squad', entryFee: 50, totalSlots: 100,
  map: 'Erangel', scheduledAt: '', roomId: '', roomPassword: '', status: 'upcoming'
};

export default function TournamentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoMode, setAutoMode] = useState(true);
  const [sponsoredPool, setSponsoredPool] = useState('');
  const [calc, setCalc] = useState(() => calcAuto(50, 100));
  const [manualKillPrize, setManualKillPrize] = useState('');
  const [manualPrizes, setManualPrizes] = useState([]);
  const isEdit = Boolean(id);
  const isFree = Number(form.entryFee) === 0;

  // Recalculate on entryFee / slots / sponsoredPool change
  useEffect(() => {
    if (autoMode) {
      const result = calcAuto(form.entryFee, form.totalSlots, manualPrizes.length || 3, sponsoredPool);
      setCalc(result);
    }
  }, [form.entryFee, form.totalSlots, autoMode, sponsoredPool]);

  // When switching to free, force manual off auto so prizes are editable
  useEffect(() => {
    if (isFree) setAutoMode(false);
  }, [isFree]);

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/tournaments/${id}`).then(r => {
        const t = r.data;
        // Format UTC date to local datetime-local input format (browser handles timezone)
        const local = new Date(t.scheduledAt);
        const pad = n => String(n).padStart(2, '0');
        const localStr = `${local.getFullYear()}-${pad(local.getMonth()+1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
        setForm({ ...t, scheduledAt: localStr });
        setManualPrizes(t.prizes || []);
        setManualKillPrize(String(t.killPrize || 0));
        setAutoMode(false);
        if (t.entryFee === 0) setSponsoredPool(String(t.prizePool || ''));
        const result = calcAuto(t.entryFee, t.totalSlots, t.prizes?.length || 3, t.prizePool || 0);
        setCalc(result);
      });
    }
  }, [id]);

  const enableAuto = () => {
    if (isFree) return; // can't auto for free tournaments
    const result = calcAuto(form.entryFee, form.totalSlots, manualPrizes.length || 3, sponsoredPool);
    setCalc(result);
    setManualPrizes(result.prizes);
    setManualKillPrize(String(result.killPrize));
    setAutoMode(true);
  };

  // When sponsored pool changes, recalc prizes in manual mode for free tournaments
  const handleSponsoredPoolChange = (val) => {
    setSponsoredPool(val);
    const result = calcAuto(0, form.totalSlots, manualPrizes.length || 3, val);
    setCalc(result);
    // Auto-fill prizes from sponsored pool
    setManualPrizes(result.prizes);
    setManualKillPrize(String(result.killPrize));
  };

  const activePrizes = autoMode ? calc.prizes : manualPrizes;
  const activeKillPrize = autoMode ? calc.killPrize : Number(manualKillPrize || 0);

  const updateManualPrize = (i, val) => {
    const p = [...manualPrizes];
    p[i] = { ...p[i], amount: Number(val) };
    setManualPrizes(p);
  };

  const addRank = () => {
    const prizes = autoMode ? [...calc.prizes] : [...manualPrizes];
    prizes.push({ rank: prizes.length + 1, amount: 0 });
    setManualPrizes(prizes);
    if (autoMode) {
      const result = calcAuto(form.entryFee, form.totalSlots, prizes.length, sponsoredPool);
      setCalc(result);
    }
  };

  const removeRank = (i) => {
    const prizes = (autoMode ? [...calc.prizes] : [...manualPrizes])
      .filter((_, idx) => idx !== i)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));
    setManualPrizes(prizes);
    if (autoMode) {
      const result = calcAuto(form.entryFee, form.totalSlots, prizes.length, sponsoredPool);
      setCalc(result);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const prizeSum = activePrizes.reduce((a, p) => a + p.amount, 0);
    const killTotal = round2(activeKillPrize * AVG_KILLS_TOP3);
    const effectivePrizePool = isFree ? Number(sponsoredPool || 0) : calc.prizePool;

    if (effectivePrizePool > 0 && prizeSum + killTotal > effectivePrizePool + 1) {
      toast.error(`Prize sum ₹${prizeSum + killTotal} exceeds prize pool ₹${effectivePrizePool}`);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        // datetime-local value is local time — new Date() converts to UTC automatically
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        killPrize: activeKillPrize,
        prizes: activePrizes,
        prizePool: effectivePrizePool,
        adminProfit: isFree ? 0 : calc.adminProfit
      };

      if (isEdit) {
        await axios.put(`/api/tournaments/${id}`, payload);
      } else {
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          fd.append(k, k === 'prizes' ? JSON.stringify(v) : v);
        });
        if (banner) fd.append('banner', banner);
        await axios.post('/api/tournaments', fd);
      }
      toast.success(isEdit ? 'Tournament updated!' : 'Tournament created!');
      navigate('/admin/tournaments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const prizeSum = activePrizes.reduce((a, p) => a + p.amount, 0);
  const killTotal = round2(activeKillPrize * AVG_KILLS_TOP3);
  const effectivePrizePool = isFree ? Number(sponsoredPool || 0) : calc.prizePool;
  const remaining = round2(effectivePrizePool - prizeSum - killTotal);
  const isOver = effectivePrizePool > 0 && remaining < -1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">{isEdit ? 'Edit Tournament' : 'Create Tournament'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isFree ? 'Free tournament — set sponsored prize pool manually' : 'Prize pool auto-calculated from entry fee × slots'}
        </p>
      </div>

      {/* Prize pool summary */}
      <div className={`card mb-6 overflow-hidden ${isFree ? 'border-purple-500/20' : 'border-orange-500/20'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-sm text-gray-400 uppercase tracking-wider">
            {isFree ? '🎁 Sponsored Prize Pool' : '💰 Prize Pool Calculator'}
          </h2>
          {!isFree && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Auto</span>
              <button type="button" onClick={() => autoMode ? setAutoMode(false) : enableAuto()}
                className={`relative w-10 h-5 rounded-full transition-colors ${autoMode ? 'bg-orange-500' : 'bg-white/10'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}
          {isFree && <span className="badge bg-purple-500/15 text-purple-400 text-xs">Free Tournament</span>}
        </div>

        {/* Free tournament: sponsored pool input */}
        {isFree ? (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
              Total Sponsored Prize Pool (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                className="input pl-8 text-lg font-bold"
                type="number" min="0" step="1"
                placeholder="e.g. 5000"
                value={sponsoredPool}
                onChange={e => handleSponsoredPoolChange(e.target.value)}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Prizes will auto-split: 1st 40% · 2nd 20% · 3rd 15% · Kills 5%. You can override below.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
              <p className="text-xs text-gray-500 mb-1">Total Entry</p>
              <p className="font-black text-white text-lg">₹{calc.total.toLocaleString()}</p>
              <p className="text-xs text-gray-600">{form.entryFee} × {form.totalSlots}</p>
            </div>
            <div className="bg-red-500/5 rounded-xl p-3 text-center border border-red-500/10">
              <p className="text-xs text-gray-500 mb-1">Admin (20%)</p>
              <p className="font-black text-red-400 text-lg">₹{calc.adminProfit.toLocaleString()}</p>
            </div>
            <div className="bg-green-500/5 rounded-xl p-3 text-center border border-green-500/10">
              <p className="text-xs text-gray-500 mb-1">Prize Pool (80%)</p>
              <p className="font-black text-green-400 text-lg">₹{calc.prizePool.toLocaleString()}</p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${isOver ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/5 border-blue-500/10'}`}>
              <p className="text-xs text-gray-500 mb-1">Unallocated</p>
              <p className={`font-black text-lg ${isOver ? 'text-red-400' : 'text-blue-400'}`}>
                {isOver ? '-' : ''}₹{Math.abs(remaining).toLocaleString()}
              </p>
              {isOver && <p className="text-xs text-red-400">Over budget!</p>}
            </div>
          </div>
        )}

        {/* Allocation bar */}
        {effectivePrizePool > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Prize allocation</span>
              <span>{Math.min(100, Math.round(((prizeSum + killTotal) / effectivePrizePool) * 100))}% allocated</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300"
                style={{ width: `${Math.min(100, Math.round((prizeSum / effectivePrizePool) * 100))}%` }} />
              <div className="h-full bg-yellow-500/70 transition-all duration-300"
                style={{ width: `${Math.min(100 - Math.round((prizeSum / effectivePrizePool) * 100), Math.round((killTotal / effectivePrizePool) * 100))}%` }} />
            </div>
            <div className="flex gap-4 mt-1.5 text-xs text-gray-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />Rank ₹{prizeSum}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />Kills ₹{killTotal}</span>
              {!isOver && effectivePrizePool > 0 && <span className="flex items-center gap-1 text-blue-400">Unallocated ₹{remaining}</span>}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-bold text-orange-400 text-sm uppercase tracking-wider">Basic Info</h2>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Title</label>
            <input className="input" placeholder="Tournament name" {...f('title')} required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Description</label>
            <textarea className="input" rows={2} placeholder="Brief description" {...f('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Mode</label>
              <select className="input" {...f('type')}>
                <option value="solo">Solo</option>
                <option value="duo">Duo</option>
                <option value="squad">Squad</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Map</label>
              <select className="input" {...f('map')}>
                {['Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Livik'].map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                Entry Fee (₹) <span className="text-gray-600 normal-case font-normal">— 0 for free</span>
              </label>
              <input className="input" type="number" min="0" placeholder="0 = Free"
                value={form.entryFee}
                onChange={e => setForm({ ...form, entryFee: e.target.value })}
                required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Total Slots</label>
              <input className="input" type="number" min="2"
                value={form.totalSlots}
                onChange={e => setForm({ ...form, totalSlots: e.target.value })}
                required />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Scheduled At</label>
            <input className="input" type="datetime-local" {...f('scheduledAt')} required />
          </div>
          {!isEdit && (
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Banner Image</label>
              <input type="file" accept="image/*" className="input" onChange={e => setBanner(e.target.files[0])} />
            </div>
          )}
        </div>

        {/* Kill prize */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-orange-400 text-sm uppercase tracking-wider">Kill Prize</h2>
            {autoMode && !isFree && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Auto</span>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
              <input
                className="input pl-8"
                type="number" min="0" step="0.01"
                placeholder="0"
                value={autoMode && !isFree ? calc.killPrize : manualKillPrize}
                readOnly={autoMode && !isFree}
                onChange={e => { if (!autoMode || isFree) { setAutoMode(false); setManualKillPrize(e.target.value); } }}
              />
            </div>
            <div className="text-sm text-gray-500 shrink-0">
              per kill · top 3 only
            </div>
          </div>
          <p className="text-xs text-gray-600">
            {isFree
              ? 'Set kill prize per kill for top 3 finishers. Can be ₹0.'
              : 'Auto: 5% of prize pool ÷ (3 winners × avg 8 kills). Toggle off to override.'}
          </p>
        </div>

        {/* Rank prizes */}
        <div className="card space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-orange-400 text-sm uppercase tracking-wider">Rank Prizes</h2>
              <p className="text-xs text-gray-600 mt-0.5">
                {isFree ? 'Manually set each rank prize' : '40% · 20% · 15% of prize pool'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              {autoMode && !isFree && <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Auto</span>}
              <button type="button" onClick={addRank} className="btn-secondary text-xs py-1 px-3">+ Add Rank</button>
            </div>
          </div>

          <div className="space-y-2">
            {activePrizes.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 text-center text-lg shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
                  <input
                    className={`input pl-8 ${autoMode && !isFree ? 'opacity-60' : ''}`}
                    type="number" min="0"
                    value={p.amount}
                    readOnly={autoMode && !isFree}
                    onChange={e => { setAutoMode(false); updateManualPrize(i, e.target.value); }}
                  />
                </div>
                {effectivePrizePool > 0 && (
                  <span className="text-xs text-gray-500 w-10 text-right shrink-0">
                    {Math.round((p.amount / effectivePrizePool) * 100)}%
                  </span>
                )}
                <button type="button" onClick={() => removeRank(i)} className="text-red-400 hover:text-red-300 w-6 text-center shrink-0">✕</button>
              </div>
            ))}
          </div>

          {isOver && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              ⚠️ Prize sum exceeds prize pool by ₹{Math.abs(remaining)}. Reduce prize amounts.
            </div>
          )}
        </div>

        {/* Room details (edit only) */}
        {isEdit && (
          <div className="card space-y-4">
            <h2 className="font-bold text-orange-400 text-sm uppercase tracking-wider">Room Details</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Room ID</label>
                <input className="input" placeholder="Room ID" {...f('roomId')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Room Password</label>
                <input className="input" placeholder="Password" {...f('roomPassword')} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Status</label>
              <select className="input" {...f('status')}>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 py-3 text-base" disabled={loading || isOver}>
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Saving...
              </span>
            ) : isEdit ? 'Update Tournament' : 'Create Tournament'}
          </button>
          <button type="button" onClick={() => navigate('/admin/tournaments')} className="btn-secondary px-6">Cancel</button>
        </div>
      </form>
    </div>
  );
}
