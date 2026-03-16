import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import MyRegistrations from './pages/MyRegistrations';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminTournaments from './pages/admin/Tournaments';
import AdminTournamentForm from './pages/admin/TournamentForm';
import AdminRegistrations from './pages/admin/Registrations';
import AdminWithdrawals from './pages/admin/Withdrawals';
import AdminUsers from './pages/admin/Users';
import AuthCallback from './pages/AuthCallback';
import Download from './pages/Download';
import Leaderboard from './pages/Leaderboard';
import HowToUse from './pages/HowToUse';
import FairPlay from './pages/FairPlay';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-orange-500"></div></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

export default function App() {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/my-registrations" element={<PrivateRoute><MyRegistrations /></PrivateRoute>} />
          <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/tournaments" element={<AdminRoute><AdminTournaments /></AdminRoute>} />
          <Route path="/admin/tournaments/new" element={<AdminRoute><AdminTournamentForm /></AdminRoute>} />
          <Route path="/admin/tournaments/:id/edit" element={<AdminRoute><AdminTournamentForm /></AdminRoute>} />
          <Route path="/admin/tournaments/:id/registrations" element={<AdminRoute><AdminRegistrations /></AdminRoute>} />
          <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
          <Route path="/download" element={<Download />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/how-to-use" element={<HowToUse />} />
          <Route path="/fair-play" element={<FairPlay />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
