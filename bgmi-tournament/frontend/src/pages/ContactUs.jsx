import { useState } from 'react';
import toast from 'react-hot-toast';

const TOPICS = [
  'Payment / Refund Issue',
  'Tournament Result Dispute',
  'Account Problem',
  'Withdrawal Issue',
  'Technical Bug',
  'Other',
];

export default function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Build mailto link with pre-filled subject and body
    const subject = encodeURIComponent(`[BGMI Arena] ${form.topic} — ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || 'Not provided'}\n\nTopic: ${form.topic}\n\nMessage:\n${form.message}`
    );
    window.location.href = `mailto:esportbgmiarena@gmail.com?subject=${subject}&body=${body}`;
    setSubmitted(true);
    toast.success('Opening your email client...');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4">📩</div>
        <h1 className="text-3xl font-black mb-2">Contact Us</h1>
        <p className="text-gray-500 text-sm">We typically respond within 24 hours on business days.</p>
      </div>

      {/* Contact cards */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <a href="mailto:esportbgmiarena@gmail.com"
          className="card flex items-center gap-4 hover:border-orange-500/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
            📧
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Email Support</p>
            <p className="font-bold text-white text-sm">esportbgmiarena@gmail.com</p>
            <p className="text-xs text-gray-600 mt-0.5">For all queries & disputes</p>
          </div>
        </a>

        <a href="https://www.instagram.com/esport_bgmi.arena" target="_blank" rel="noreferrer"
          className="card flex items-center gap-4 hover:border-pink-500/30 transition-all group">
          <div className="w-12 h-12 rounded-2xl bg-pink-500/15 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="url(#ig)" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="ig" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433"/>
                  <stop offset="25%" stopColor="#e6683c"/>
                  <stop offset="50%" stopColor="#dc2743"/>
                  <stop offset="75%" stopColor="#cc2366"/>
                  <stop offset="100%" stopColor="#bc1888"/>
                </linearGradient>
              </defs>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Instagram</p>
            <p className="font-bold text-white text-sm">@esport_bgmi.arena</p>
            <p className="text-xs text-gray-600 mt-0.5">Follow for updates & announcements</p>
          </div>
        </a>

        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 flex items-center justify-center text-2xl shrink-0">
            📱
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Support Hours</p>
            <p className="font-bold text-white text-sm">Mon – Sat</p>
            <p className="text-xs text-gray-600 mt-0.5">10:00 AM – 8:00 PM IST</p>
          </div>
        </div>
      </div>

      {/* Response time notice */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 mb-8 flex items-start gap-3">
        <span className="text-blue-400 text-lg shrink-0">ℹ️</span>
        <p className="text-sm text-gray-400">
          For urgent issues like payment failures or match disputes, email us directly at{' '}
          <a href="mailto:esportbgmiarena@gmail.com" className="text-orange-400 hover:underline">esportbgmiarena@gmail.com</a>{' '}
          with your registered email and tournament details.
        </p>
      </div>

      {/* Contact form */}
      {submitted ? (
        <div className="card border-green-500/20 text-center py-12">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-black text-green-400 mb-2">Email Client Opened</h2>
          <p className="text-gray-400 text-sm mb-6">
            Your message has been pre-filled in your email client. Just hit Send!<br />
            If it didn't open, email us directly at{' '}
            <a href="mailto:esportbgmiarena@gmail.com" className="text-orange-400 hover:underline">esportbgmiarena@gmail.com</a>
          </p>
          <button onClick={() => setSubmitted(false)} className="btn-secondary text-sm">Send Another Message</button>
        </div>
      ) : (
        <div className="card">
          <h2 className="font-black text-lg mb-5">Send a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Your Name</label>
                <input className="input" placeholder="John Doe" {...f('name')} required />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Email</label>
                <input className="input" type="email" placeholder="your@email.com" {...f('email')} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                  Phone <span className="text-gray-600 normal-case font-normal">(optional)</span>
                </label>
                <input className="input" placeholder="9876543210" {...f('phone')} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Topic</label>
                <select className="input" {...f('topic')} required>
                  <option value="">Select a topic</option>
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Message</label>
              <textarea
                className="input resize-none"
                rows={5}
                placeholder="Describe your issue in detail. Include tournament name, date, and any relevant information..."
                {...f('message')}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3">
              📧 Send Message
            </button>
            <p className="text-xs text-gray-600 text-center">
              This will open your email client with the message pre-filled.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
