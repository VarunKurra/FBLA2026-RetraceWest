import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from './pages/Home';
import Registry from './pages/Registry';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Report from './pages/Report';
import SpatialMap from './pages/SpatialMap';
import About from './pages/About';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';

import Navbar from './components/Navbar';
import PrecisionNavigator from './components/PrecisionNavigator';
import AssistButton from './components/AssistButton';
import AssistAnnouncer from './components/AssistAnnouncer';
import { AppProvider, useApp } from './context/AppContext';
import { getLocalSessionUser } from './services/authService';

const AdminRoute = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const localUser = getLocalSessionUser();
    if (localUser?.role === 'admin' && !state.user) {
      dispatch({ type: 'LOGIN', payload: localUser });
    }
  }, [dispatch, state.user]);

  const user = state.user || getLocalSessionUser();
  if (user?.role === 'admin') return <Admin />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => (
  <AppProvider>
    <Router>
      <AppContent />
    </Router>
  </AppProvider>
);

const AppContent = () => {
  const { state } = useApp();
  const location = useLocation();

  useEffect(() => {
    if (!window.speechSynthesis) return undefined;

    const loadVoices = () => window.speechSynthesis.getVoices();
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis.onvoiceschanged === loadVoices) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  return (
    <div className="app-v5">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Navbar />
      <AssistAnnouncer />

      <main id="main-content" role="main" aria-label="RetraceWest main content">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/registry" element={<Registry />} />
            <Route path="/report" element={<Report />} />
            <Route path="/map" element={<SpatialMap />} />
            <Route path="/leaderboard" element={<Leaderboard />} />

            <Route path="/admin" element={<AdminRoute />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <AssistButton />

      <AnimatePresence>
        {state.activeItem && (
          <PrecisionNavigator target={state.activeItem} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
