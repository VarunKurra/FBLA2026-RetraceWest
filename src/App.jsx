import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Registry from './pages/Registry';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Report from './pages/Report';
import SpatialMap from './pages/SpatialMap';

import Navbar from './components/Navbar';
import PrecisionNavigator from './components/PrecisionNavigator';
import { AppProvider, useApp } from './context/AppContext';

// the main app component - keeping it clean
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
  // grabbing state from our global context, super handy
  const { state, dispatch } = useApp();
  const location = useLocation();

  return (
    <div className="app-v4">
      {/* basic navigation, hopefully no one gets lost lol */}
      <Navbar />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/registry" element={<Registry />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/report" element={<Report />} />
          <Route path="/map" element={<SpatialMap />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>

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
