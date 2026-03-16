import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bgmiId: user?.bgmiId || '',
    bgmiName: user?.bgmiName || '',
    upiId: user?.upiId || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.put('/api/users/me', form);
      setUser(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account details</p>
      </div>

      {/* Avatar card */}
      <div className="card mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-500/20">
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-lg">{user.name}</p>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <span className={`badge text-xs mt-1 ${user.role === 'admin' ? 'bg-orange-500/15 text-orange-400' : 'bg-white/5 text-gray-400'}`}>
            {user.role}
          </span>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Phone</label>
            <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">BGMI ID</label>
              <input className="input" value={form.bgmiId} onChange={e => setForm({ ...form, bgmiId: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">BGMI Name</label>
              <input className="input" value={form.bgmiName} onChange={e => setForm({ ...form, bgmiName: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">UPI ID</label>
            <input className="input" placeholder="yourname@paytm" value={form.upiId} onChange={e => setForm({ ...form, upiId: e.target.value })} />
            <p className="text-xs text-gray-600 mt-1">Used for prize withdrawals</p>
          </div>
          <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
