import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function Wallet() {
  const { user, setUser } = useAuth();
  const [data, setData] = useState({ wallet: 0, upiId: '', transactions: [] });
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [tab, setTab] = useState('transactions');

  // Deposit state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  // Withdraw state
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', upiId: '' });
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchData = async () => {
    try {
      const [w, wd] = await Promise.all([
        axios.get('/api/wallet'),
        axios.get('/api/wallet/withdrawals')
      ]);
      setData(w.data);
      setWithdrawals(wd.data);
      setWithdrawForm(f => ({ ...f, upiId: w.data.upiId || '' }));
      if (setUser) setUser(u => u ? { ...u, wallet: w.data.wallet } : u);
    } catch {
      setFetchError(true);
    }
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, []);

  // ── Deposit via Razorpay ──────────────────────────────────────────
  const handleDeposit = async (e) => {
    e.preventDefault();
    const amt = Number(depositAmount);
    if (!amt || amt < 10) return toast.error('Minimum deposit is ₹10');
    setDepositing(true);
    try {
      const { data: order } = await axios.post('/api/wallet/deposit/order', { amount: amt });
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'BGMI Arena',
        description: 'Wallet Deposit',
        order_id: order.id,
        handler: async (response) => {
          try {
            await axios.post('/api/wallet/deposit/verify', { ...response, amount: amt });
            toast.success(`₹${amt} added to wallet!`);
            setDepositAmount('');
            fetchData();
          } catch {
            toast.error('Payment verification failed');
          } finally {
            setDepositing(false);
          }
        },
        prefill: { name: user?.name, email: user?.email },
        theme: { color: '#f97316' },
        modal: { ondismiss: () => setDepositing(false) }
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => { toast.error('Payment failed'); setDepositing(false); });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
      setDepositing(false);
    }
  };

  // ── Withdraw ──────────────────────────────────────────────────────
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (Number(withdrawForm.amount) < 10) return toast.error('Minimum withdrawal is ₹10');
    setWithdrawing(true);
    try {
      await axios.post('/api/wallet/withdraw', {
        amount: Number(withdrawForm.amount),
        upiId: withdrawForm.upiId
      });
      toast.success('Withdrawal request submitted!');
      setWithdrawForm(f => ({ ...f, amount: '' }));
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setWithdrawing(false);
    }
  };

  const statusConfig = {
    pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    approved: 'bg-green-500/10 text-green-400 border-green-500/20',
    rejected: 'bg-red-500/10 text-red-400 border-red-500/20'
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    </div>
  );

  if (fetchError) return (
    <div className="max-w-2xl mx-auto px-4 py-32 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <p className="text-gray-400 font-medium mb-4">Failed to load wallet data</p>
      <button onClick={() => { setFetchError(false); setLoading(true); fetchData().finally(() => setLoading(false)); }}
        className="btn-primary">Try Again</button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">My Wallet</h1>
        <p className="text-gray-500 text-sm mt-1">Deposit, withdraw & track your earnings</p>
      </div>

      {/* Balance card */}
      <div className="relative overflow-hidden card mb-6 py-10 text-center border-orange-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />
        <p className="text-gray-400 text-sm mb-2">Available Balance</p>
        <p className="text-6xl font-black">
          <span className="text-gray-400 text-3xl">₹</span>
          <span className="text-orange-400">{data.wallet}</span>
        </p>
        <p className="text-gray-600 text-xs mt-2">Prizes are credited to team leader's wallet</p>
      </div>

      {/* ── Deposit ── */}
      <div className="card mb-4 border-green-500/10">
        <h2 className="font-bold mb-1 flex items-center gap-2 text-green-400">
          <span>💳</span> Add Money to Wallet
        </h2>
        <p className="text-xs text-gray-500 mb-4">Min ₹10 · Instant · Powered by Razorpay</p>

        {/* Quick amounts */}
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_AMOUNTS.map(a => (
            <button key={a} type="button"
              onClick={() => setDepositAmount(String(a))}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${
                depositAmount === String(a)
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-green-500/40 hover:text-white'
              }`}>
              ₹{a}
            </button>
          ))}
        </div>

        <form onSubmit={handleDeposit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
            <input
              className="input pl-8"
              type="number"
              min="10"
              step="1"
              placeholder="Enter amount"
              value={depositAmount}
              onChange={e => setDepositAmount(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-success px-6 py-2.5 whitespace-nowrap" disabled={depositing}>
            {depositing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing...
              </span>
            ) : '+ Add Money'}
          </button>
        </form>
      </div>

      {/* ── Withdraw ── */}
      <div className="card mb-6">
        <h2 className="font-bold mb-1 flex items-center gap-2">
          <span>💸</span> Withdraw to UPI
        </h2>
        <p className="text-xs text-gray-500 mb-4">Min ₹10 · Processed within 24 hours</p>
        <form onSubmit={handleWithdraw} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">UPI ID</label>
            <input className="input" placeholder="yourname@paytm / name@upi"
              value={withdrawForm.upiId}
              onChange={e => setWithdrawForm({ ...withdrawForm, upiId: e.target.value })}
              required />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input className="input pl-8" type="number" min="10" max={data.wallet}
                placeholder="0"
                value={withdrawForm.amount}
                onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                required />
            </div>
            <p className="text-xs text-gray-600 mt-1">Available: ₹{data.wallet}</p>
          </div>
          <button type="submit" className="btn-primary w-full py-3"
            disabled={withdrawing || data.wallet < 10}>
            {withdrawing ? 'Submitting...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2 mb-4">
        {['transactions', 'withdrawals'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`tab-btn capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}>
            {t}
            <span className="ml-1.5 text-xs opacity-60">
              ({t === 'transactions' ? data.transactions.length : withdrawals.length})
            </span>
          </button>
        ))}
      </div>

      {tab === 'transactions' && (
        <div className="space-y-2">
          {data.transactions.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No transactions yet</div>
          ) : data.transactions.map(tx => (
            <div key={tx._id} className="card flex items-center justify-between py-3.5">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                  tx.type === 'credit' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}>
                  {tx.type === 'credit' ? '↓' : '↑'}
                </div>
                <div>
                  <p className="text-sm font-medium">{tx.description}</p>
                  <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <span className={`font-black text-base ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === 'withdrawals' && (
        <div className="space-y-2">
          {withdrawals.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">No withdrawal requests</div>
          ) : withdrawals.map(w => (
            <div key={w._id} className="card py-3.5">
              <div className="flex items-center justify-between mb-1">
                <p className="font-black text-lg">₹{w.amount}</p>
                <span className={`badge border text-xs ${statusConfig[w.status]}`}>{w.status}</span>
              </div>
              <p className="text-sm text-gray-400 font-mono">{w.upiId}</p>
              <p className="text-xs text-gray-600 mt-1">{new Date(w.createdAt).toLocaleString('en-IN')}</p>
              {w.adminNote && (
                <p className="text-xs text-gray-400 mt-1 bg-white/3 rounded-lg px-2 py-1">Note: {w.adminNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
