import { Link } from 'react-router-dom';

const stats = [
  { value: '100+', label: 'Tournaments Hosted' },
  { value: '5,000+', label: 'Registered Players' },
  { value: '₹2L+', label: 'Prizes Distributed' },
  { value: '99%', label: 'Uptime' },
];

const values = [
  { icon: '⚖️', title: 'Fair Play First', desc: 'Every match is monitored for cheating. We use screenshot verification and admin review to ensure results are always honest.' },
  { icon: '⚡', title: 'Instant Payouts', desc: 'Prizes are credited to your wallet the moment admin verifies results. No waiting, no delays.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'All payments are processed by Razorpay — India\'s most trusted payment gateway. We never store your card or bank details.' },
  { icon: '🎮', title: 'Built for BGMI Players', desc: 'We\'re gamers ourselves. Every feature — from room ID delivery to kill-based prizes — is designed around how BGMI tournaments actually work.' },
];

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="flex justify-center mb-5">
          <img src="/logo.svg" alt="BGMI Arena" className="w-16 h-16 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 20px rgba(249,115,22,0.4))' }} />
        </div>
        <h1 className="text-4xl font-black mb-3">
          About <span className="text-orange-400">BGMI Arena</span>
        </h1>
        <p className="text-gray-400 text-base max-w-2xl mx-auto leading-relaxed">
          India's competitive BGMI tournament platform — where players compete in Solo, Duo, and Squad matches for real cash prizes every day.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
        {stats.map(s => (
          <div key={s.label} className="card text-center py-6 border-orange-500/10">
            <p className="text-3xl font-black text-orange-400 mb-1">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="card border-orange-500/15 mb-8">
        <h2 className="text-xl font-black mb-3">Our Mission</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          BGMI Arena was built to give every BGMI player — from casual to competitive — a fair, transparent, and rewarding tournament experience. We handle the logistics so you can focus on the game. Register, play, win, and get paid. That's it.
        </p>
      </div>

      {/* Values */}
      <h2 className="text-xl font-black mb-5">What We Stand For</h2>
      <div className="grid md:grid-cols-2 gap-4 mb-14">
        {values.map(v => (
          <div key={v.title} className="card flex gap-4 items-start">
            <div className="text-2xl shrink-0">{v.icon}</div>
            <div>
              <h3 className="font-bold text-white mb-1">{v.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contact block */}
      <div className="card border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent mb-8">
        <h2 className="text-xl font-black mb-4">Get in Touch</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-lg shrink-0">📧</div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Email</p>
              <a href="mailto:esportbgmiarena@gmail.com" className="text-orange-400 hover:text-orange-300 font-medium text-sm transition-colors">
                esportbgmiarena@gmail.com
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-lg shrink-0">📱</div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Support Hours</p>
              <p className="text-white font-medium text-sm">Mon–Sat, 10am–8pm IST</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5">
          <Link to="/contact" className="btn-primary text-sm py-2 px-5 inline-flex">
            📩 Contact Us
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-gray-600 text-xs">
        BGMI Arena is an independent platform and is not affiliated with, endorsed by, or connected to Krafton Inc. or Battlegrounds Mobile India (BGMI).
      </p>
    </div>
  );
}
