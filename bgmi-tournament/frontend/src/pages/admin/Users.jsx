import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addFunds, setAddFunds] = useState({ userId: '', amount: '', desc: '' });

  useEffect(() => {
    axios.get('/api/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const handleAddFunds = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/wallet/admin/add-funds', {
        userId: addFunds.userId,
        amount: Number(addFunds.amount),
        description: addFunds.desc
      });
      toast.success('Funds added!');
      setAddFunds({ userId: '', amount: '', desc: '' });
    } catch {
      toast.error('Failed');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.bgmiName?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Users ({users.length})</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-2">
          <input className="input" placeholder="Search by name, email, BGMI name..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <form onSubmit={handleAddFunds} className="card space-y-2">
          <p className="text-sm font-bold text-orange-500">Add Funds to User</p>
          <select className="input text-sm" value={addFunds.userId} onChange={e => setAddFunds({ ...addFunds, userId: e.target.value })} required>
            <option value="">Select user</option>
            {users.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
          <input className="input text-sm" type="number" min="1" placeholder="Amount ₹" value={addFunds.amount}
            onChange={e => setAddFunds({ ...addFunds, amount: e.target.value })} required />
          <input className="input text-sm" placeholder="Description" value={addFunds.desc}
            onChange={e => setAddFunds({ ...addFunds, desc: e.target.value })} />
          <button type="submit" className="btn-primary w-full text-sm py-2">Add Funds</button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-gray-700">
              <th className="text-left py-3 px-2">Name</th>
              <th className="text-left py-3 px-2">Email</th>
              <th className="text-left py-3 px-2">BGMI</th>
              <th className="text-left py-3 px-2">Phone</th>
              <th className="text-left py-3 px-2">Wallet</th>
              <th className="text-left py-3 px-2">UPI</th>
              <th className="text-left py-3 px-2">Role</th>
              <th className="text-left py-3 px-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} className="border-b border-gray-800 hover:bg-dark-700/50">
                <td className="py-3 px-2 font-medium">{u.name}</td>
                <td className="py-3 px-2 text-gray-400">{u.email}</td>
                <td className="py-3 px-2">
                  <p>{u.bgmiName}</p>
                  <p className="text-gray-500 text-xs">{u.bgmiId}</p>
                </td>
                <td className="py-3 px-2 text-gray-400">{u.phone}</td>
                <td className="py-3 px-2 font-bold text-green-400">₹{u.wallet}</td>
                <td className="py-3 px-2 text-gray-400 font-mono text-xs">{u.upiId || '—'}</td>
                <td className="py-3 px-2">
                  <span className={`badge ${u.role === 'admin' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>{u.role}</span>
                </td>
                <td className="py-3 px-2 text-gray-500 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
