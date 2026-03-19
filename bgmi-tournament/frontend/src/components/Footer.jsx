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
            <a href="https://www.instagram.com/esport_bgmi.arena" target="_blank" rel="noreferrer"
              className="text-xs text-pink-400 hover:text-pink-300 transition-colors flex items-center gap-1.5 mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              @esport_bgmi.arena
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
