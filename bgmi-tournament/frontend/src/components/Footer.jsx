import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-16 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.svg" alt="BGMI Arena" className="w-7 h-7" />
              <span className="font-black text-base">
                <span className="text-orange-400">BGMI</span>
                <span className="text-white"> Arena</span>
              </span>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed mb-3">
              Competitive BGMI tournaments with real cash prizes. Play fair, win big.
            </p>
            <a href="mailto:esportbgmiarena@gmail.com"
              className="text-xs text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5">
              📧 esportbgmiarena@gmail.com
            </a>
          </div>

          {/* Play */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">Play</p>
            <div className="space-y-2">
              <FooterLink to="/tournaments">Tournaments</FooterLink>
              <FooterLink to="/leaderboard">Leaderboard</FooterLink>
              <FooterLink to="/my-registrations">My Matches</FooterLink>
              <FooterLink to="/wallet">Wallet</FooterLink>
              <FooterLink to="/download">Get App</FooterLink>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">Company</p>
            <div className="space-y-2">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/contact">Contact Us</FooterLink>
              <FooterLink to="/how-to-use">How to Use</FooterLink>
              <FooterLink to="/fair-play">Fair Play</FooterLink>
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider mb-3">Legal</p>
            <div className="space-y-2">
              <FooterLink to="/terms">Terms of Service</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/refund-policy">Refund Policy</FooterLink>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-600 text-xs">© {new Date().getFullYear()} BGMI Arena. All rights reserved.</p>
          <p className="text-gray-700 text-xs">Not affiliated with Krafton Inc. or BGMI.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link to={to} className="block text-gray-500 hover:text-gray-300 text-xs transition-colors">
      {children}
    </Link>
  );
}
