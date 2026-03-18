import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const ADMIN_UPI_ID = 'spalande092@oksbi';
const ADMIN_UPI_NAME = 'BGMI Arena';
const QUICK_AMOUNTS = [49, 99, 199, 499, 999];

const getQrUrl = (amount) => {
  const upi = amount
    ? `upi://pay?pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_UPI_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent('BGMI Arena Wallet')}`
    : `upi://pay?pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_UPI_NAME)}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upi)}`;
};

const STEPS = ['Enter Amount', 'Pay via UPI', 'Upload Proof'];

export default function Deposit() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyUpi = () => {
    navigator.clipboard.writeText(ADMIN_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleScreenshot = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('Only image files allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max file size is 5MB'); return; }
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!screenshot) { toast.error('Please upload your payment screenshot'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('amount', Number(amount));
      fd.append('utrNumber', utrNumber.trim());
      fd.append('screenshot', screenshot);
      await axios.post('/api/wallet/deposit', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Deposit submitted! Admin will verify shortly.');
      navigate('/wallet');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-gradient pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl shadow-green-500/30 mb-4 text-2xl">
            💳
          </div>
          <h1 className="text-3xl font-black">Add Money</h1>
          <p className="text-gray-500 mt-1 text-sm">Instant wallet top-up via UPI</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                  i < step ? 'bg-green-500 text-white' :
                  i === step ? 'bg-orange-500 text-white ring-4 ring-orange-500/20' :
                  'bg-white/10 text-gray-500'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-semibold whitespace-nowrap ${i === step ? 'text-orange-400' : i < step ? 'text-green-400' : 'text-gray-600'}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 w-12 mb-4 mx-1 transition-all duration-300 ${i < step ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 0: Enter Amount ── */}
        {step === 0 && (
          <div className="card glow-orange">
            <h2 className="font-bold text-lg mb-1">How much to add?</h2>
            <p className="text-gray-500 text-xs mb-5">Min ₹10 · Max ₹50,000</p>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} type="button"
                  onClick={() => setAmount(String(a))}
                  className={`py-2.5 rounded-xl text-sm font-black border transition-all ${
                    amount === String(a)
                      ? 'bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:border-orange-500/40 hover:text-white'
                  }`}>
                  ₹{a}
                </button>
              ))}
            </div>

            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg">₹</span>
              <input
                className="input pl-9 text-xl font-black h-14"
                type="number" min="10" max="50000" placeholder="0"
                value={amount} onChange={e => setAmount(e.target.value)}
              />
            </div>

            <button
              onClick={() => {
                const amt = Number(amount);
                if (!amt || amt < 10) { toast.error('Minimum deposit is ₹10'); return; }
                if (amt > 50000) { toast.error('Maximum deposit is ₹50,000'); return; }
                setStep(1);
              }}
              className="btn-primary w-full py-3.5 text-base"
            >
              Continue →
            </button>

            <div className="mt-4 text-center">
              <Link to="/wallet" className="text-gray-500 hover:text-gray-300 text-sm transition-colors">← Back to Wallet</Link>
            </div>
          </div>
        )}

        {/* ── STEP 1: Pay via UPI ── */}
        {step === 1 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Pay ₹{amount} via UPI</h2>
              <span className="text-2xl font-black text-green-400">₹{amount}</span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                <div className="w-52 h-52 bg-white rounded-2xl p-2 shadow-2xl shadow-black/40">
                  <img
                    src={getQrUrl(amount)}
                    alt="UPI QR Code"
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-black px-3 py-1 rounded-full whitespace-nowrap shadow-lg">
                  ₹{amount} pre-filled
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-6">Scan with any UPI app</p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-gray-500 font-semibold">OR PAY MANUALLY</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* UPI ID */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 font-semibold">UPI ID</p>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-black text-white font-mono">{ADMIN_UPI_ID}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ADMIN_UPI_NAME}</p>
                </div>
                <button
                  onClick={copyUpi}
                  className={`shrink-0 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${
                    copied ? 'bg-green-500/20 border-green-500/40 text-green-400' : 'bg-white/5 border-white/10 text-gray-300 hover:border-orange-500/40 hover:text-white'
                  }`}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Supported apps */}
            <div className="flex items-center justify-center gap-3 mb-5">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                <span key={app} className="text-xs text-gray-600 bg-white/5 px-2 py-1 rounded-lg">{app}</span>
              ))}
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-5 flex gap-2">
              <span className="text-yellow-400 shrink-0">⚠️</span>
              <p className="text-xs text-yellow-300">Pay exactly <strong>₹{amount}</strong> and keep the payment screenshot — you'll need it in the next step.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary flex-1 py-3">← Back</button>
              <button onClick={() => setStep(2)} className="btn-primary flex-2 py-3 flex-1">I've Paid →</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Upload Proof ── */}
        {step === 2 && (
          <div className="card">
            <h2 className="font-bold text-lg mb-1">Upload Payment Proof</h2>
            <p className="text-gray-500 text-xs mb-5">Screenshot of your ₹{amount} payment</p>

            {/* Screenshot upload */}
            <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all mb-4 ${
              screenshotPreview ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 hover:border-orange-500/40 hover:bg-white/3'
            }`}>
              {screenshotPreview ? (
                <div className="w-full">
                  <img src={screenshotPreview} alt="Payment proof" className="max-h-52 mx-auto rounded-xl object-contain" />
                  <p className="text-xs text-green-400 text-center mt-2 font-semibold">✓ Screenshot uploaded</p>
                </div>
              ) : (
                <>
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-3">📸</div>
                  <p className="text-sm font-semibold text-gray-300">Tap to upload screenshot</p>
                  <p className="text-xs text-gray-600 mt-1">JPG, PNG · Max 5MB</p>
                </>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleScreenshot} />
            </label>

            {screenshotPreview && (
              <button type="button" onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                className="text-xs text-red-400 hover:text-red-300 mb-4 block">
                Remove and re-upload
              </button>
            )}

            {/* UTR */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">
                UTR / Transaction ID <span className="text-gray-600 normal-case font-normal">(optional but speeds up approval)</span>
              </label>
              <input
                className="input font-mono"
                placeholder="e.g. 425612345678"
                value={utrNumber}
                onChange={e => setUtrNumber(e.target.value)}
              />
            </div>

            {/* Summary */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="font-black text-green-400">₹{amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Paid to</span>
                <span className="font-mono text-gray-300 text-xs">{ADMIN_UPI_ID}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Credited to</span>
                <span className="text-gray-300">Your wallet</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Processing time</span>
                <span className="text-yellow-400">Within a few hours</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !screenshot}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2 justify-center">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                    Submitting...
                  </span>
                ) : 'Submit Request ✓'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
