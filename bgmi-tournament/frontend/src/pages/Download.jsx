import { useState, useEffect } from 'react';

export default function Download() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    // Catch the install prompt
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
    setInstalling(false);
  };

  const steps = [
    {
      icon: '🌐',
      title: 'Open in Chrome',
      desc: 'Make sure you\'re using Google Chrome browser on your Android phone.'
    },
    {
      icon: '⋮',
      title: 'Tap the Menu',
      desc: 'Tap the three-dot menu (⋮) in the top-right corner of Chrome.'
    },
    {
      icon: '📲',
      title: 'Add to Home Screen',
      desc: 'Tap "Add to Home screen" or "Install App" from the menu options.'
    },
    {
      icon: '✅',
      title: 'Confirm Install',
      desc: 'Tap "Add" or "Install" on the popup. The app icon will appear on your home screen.'
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/5 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-500/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center relative">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/20 flex items-center justify-center shadow-2xl shadow-orange-500/20">
                <img src="/logo.svg" alt="BGMI Arena" className="w-20 h-20" style={{ filter: 'drop-shadow(0 0 16px rgba(249,115,22,0.5))' }} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-xs font-black shadow-lg">
                ✓
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            BGMI <span className="text-orange-400">Arena</span>
          </h1>
          <p className="text-gray-400 text-lg mb-2">India's Premier BGMI Tournament Platform</p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-8">
            <span className="flex items-center gap-1"><span className="text-green-400">●</span> Free to Install</span>
            <span className="flex items-center gap-1"><span className="text-blue-400">●</span> No Play Store Needed</span>
            <span className="flex items-center gap-1"><span className="text-orange-400">●</span> 100% Safe</span>
          </div>

          {/* Install button */}
          {installed ? (
            <div className="inline-flex items-center gap-3 bg-green-500/10 border border-green-500/30 text-green-400 font-bold px-8 py-4 rounded-2xl text-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              App Installed Successfully!
            </div>
          ) : deferredPrompt ? (
            <button onClick={handleInstall} disabled={installing}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-black px-10 py-4 rounded-2xl text-lg shadow-2xl shadow-orange-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-70">
              {installing ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Installing...</>
              ) : (
                <><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Install App — Free</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 text-orange-300 font-bold px-8 py-4 rounded-2xl text-base">
                📲 Follow the steps below to install
              </div>
            </div>
          )}

          <p className="text-gray-600 text-xs mt-4">Works on Android · Chrome browser required</p>
        </div>
      </div>

      {/* Safety notice */}
      <div className="max-w-4xl mx-auto px-4 mb-10">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5 flex gap-4">
          <div className="text-2xl shrink-0">🔒</div>
          <div>
            <h3 className="font-bold text-blue-400 mb-1">100% Safe — Why no Play Store?</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              BGMI Arena is a <strong className="text-white">Progressive Web App (PWA)</strong> — the same technology used by Twitter, Uber, and Flipkart for their apps.
              It installs directly from our website with no APK download, no unknown sources, and no permissions beyond what a normal website uses.
              Your data is fully secure and the app updates automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Step by step */}
      <div className="max-w-4xl mx-auto px-4 mb-12">
        <h2 className="text-2xl font-black text-center mb-2">How to Install</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Takes less than 30 seconds</p>

        <div className="grid md:grid-cols-2 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 flex gap-4 hover:border-orange-500/20 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-xl shrink-0">
                {step.icon}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">Step {i + 1}</span>
                  <h3 className="font-bold text-sm">{step.title}</h3>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <h2 className="text-2xl font-black text-center mb-8">What You Get</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🏆', label: 'Live Tournaments', desc: 'Solo, Duo & Squad' },
            { icon: '💰', label: 'Real Cash Prizes', desc: 'Instant wallet payout' },
            { icon: '📧', label: 'Room Alerts', desc: 'Email notifications' },
            { icon: '💳', label: 'Secure Payments', desc: 'Razorpay powered' },
          ].map(f => (
            <div key={f.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="font-bold text-sm">{f.label}</p>
              <p className="text-gray-500 text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-black text-center mb-8">Common Questions</h2>
        <div className="space-y-3">
          {[
            { q: 'Is this safe to install?', a: 'Yes. This is a PWA — it installs like a bookmark, not an APK. No unknown sources setting needed. It\'s the same tech used by major apps.' },
            { q: 'Will it work without internet?', a: 'Basic pages load offline. For tournaments and payments, internet is required.' },
            { q: 'How do I uninstall it?', a: 'Long press the app icon on your home screen → Uninstall. Same as any other app.' },
            { q: 'Does it drain battery?', a: 'No more than a regular website. PWAs are lightweight and efficient.' },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <p className="font-bold text-sm mb-1.5">❓ {item.q}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
