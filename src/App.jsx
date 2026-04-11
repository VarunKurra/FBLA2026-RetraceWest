import React from 'react';
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
import { AppProvider, useApp } from './context/AppContext';

// top-level wrapper keeps routing inside the provider
const App = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

const AppContent = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();

  return (
    <div className="app-v5">
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />

          {/* Auth-protected routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/report" element={<Report />} />
          <Route path="/map" element={<SpatialMap />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Admin only */}
          <Route
            path="/admin"
            element={
              state.user?.role === 'admin'
                ? <Admin />
                : <Navigate to="/dashboard" replace />
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Global navigation overlay (rendered on top of everything) */}
      <AnimatePresence>
        {state.activeItem && (
          <PrecisionNavigator
            target={state.activeItem}
            onArrival={() => dispatch({ type: 'STOP_NAVIGATION' })}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
