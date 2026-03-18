import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [form, setForm] = useState({ upiId: '', upiName: 'BGMI Arena', upiQrUrl: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/wallet/settings')
      .then(r => setForm({ upiId: r.data.upiId || '', upiName: r.data.upiName || 'BGMI Arena', upiQrUrl: r.data.upiQrUrl || '' }))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.upiId.trim()) { toast.error('UPI ID is required'); return; }
    setSaving(true);
    try {
      await axios.put('/api/wallet/admin/settings', form);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center py-32">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Payment Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure the UPI details shown to users on the deposit page</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* UPI ID */}
        <div className="card">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <span className="text-xl">💳</span> UPI Configuration
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                UPI ID <span className="text-red-400">*</span>
              </label>
              <input
                className="input font-mono"
                placeholder="e.g. yourname@oksbi"
                value={form.upiId}
                onChange={e => setForm(f => ({ ...f, upiId: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-600 mt-1">This is the UPI ID users will pay to. Example: spalande092@oksbi</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                className="input"
                placeholder="e.g. BGMI Arena"
                value={form.upiName}
                onChange={e => setForm(f => ({ ...f, upiName: e.target.value }))}
              />
              <p className="text-xs text-gray-600 mt-1">Name shown below the UPI ID on the deposit page</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Custom QR Code URL <span className="text-gray-600 normal-case font-normal">(optional)</span>
              </label>
              <input
                className="input"
                placeholder="https://... (leave blank to auto-generate)"
                value={form.upiQrUrl}
                onChange={e => setForm(f => ({ ...f, upiQrUrl: e.target.value }))}
              />
              <p className="text-xs text-gray-600 mt-1">If blank, a QR code is auto-generated from your UPI ID. Upload your own QR image to Cloudinary/Imgur and paste the URL here.</p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {form.upiId && (
          <div className="card bg-white/3 border-white/5">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preview</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-black font-mono text-white">{form.upiId}</p>
                <p className="text-xs text-gray-500 mt-0.5">{form.upiName || 'BGMI Arena'}</p>
              </div>
              <span className="text-xs bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-1 rounded-lg font-semibold">Active</span>
            </div>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full py-3.5 text-base disabled:opacity-50">
          {saving ? (
            <span className="flex items-center gap-2 justify-center">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Saving...
            </span>
          ) : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
