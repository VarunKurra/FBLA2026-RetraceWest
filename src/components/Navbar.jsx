import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Trophy, Shield,
  Home, Info, LayoutDashboard, BookOpen,
  Map, FileText, Settings
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV_ICONS = {
  '/':          <Home size={14} />,
  '/about':     <Info size={14} />,
  '/dashboard': <LayoutDashboard size={14} />,
  '/registry':  <BookOpen size={14} />,
  '/map':       <Map size={14} />,
  '/report':    <FileText size={14} />,
  '/admin':     <Settings size={14} />,
};

const Navbar = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const publicLinks = [
    { to: '/',       label: 'Home' },
    { to: '/about',  label: 'About' },
  ];

  const authedLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/registry',  label: 'Registry' },
    { to: '/map',       label: 'Map' },
    { to: '/report',    label: 'Report Item' },
  ];

  const visibleLinks = state.user
    ? (state.user.role === 'admin'
      ? publicLinks  // Admins only see Home, About (Admin link is added separately)
      : [...publicLinks, ...authedLinks])
    : publicLinks;

  const handleSignOut = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <>
      <nav className="navbar-pw">
        {/* 3-column grid: brand | links | controls */}
        <div className="navbar-inner">

          {/* ── Col 1: Brand ── */}
          <Link to="/" className="nav-brand" onClick={() => setMobileOpen(false)}>
            <div className="nav-logo-box">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                   stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <circle cx="12" cy="11" r="3"/>
              </svg>
            </div>
            <div className="nav-brand-text">
              <span className="nav-brand-name">RetraceWest</span>
              <span className="nav-brand-sub">Parkway West High School</span>
            </div>
          </Link>

          {/* ── Col 2: Nav Links (centered) ── */}
          <div className="nav-links">
            {visibleLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
              >
                <span className="nav-link-icon">{NAV_ICONS[link.to]}</span>
                {link.label}
              </Link>
            ))}
            {state.user?.role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <span className="nav-link-icon">{NAV_ICONS['/admin']}</span>
                Admin
              </Link>
            )}
          </div>

          {/* ── Col 3: Right controls ── */}
          <div className="nav-right">
            {state.user ? (
              <>
                {state.user.role === 'admin' && (
                  <div className="nav-admin-badge">
                    <Shield size={10} /> Admin
                  </div>
                )}
                <Link to="/leaderboard" className="nav-points-chip" style={{ textDecoration: 'none' }}>
                  <Trophy size={13} />
                  {state.user.points ?? 0} pts
                </Link>
                <button className="nav-sign-out" onClick={handleSignOut}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="nav-sign-in">Sign In</Link>
            )}
            <button className="nav-mobile-btn" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`nav-mobile-menu ${mobileOpen ? 'open' : ''}`}>
        {visibleLinks.map(link => (
          <Link key={link.to} to={link.to} className="nav-mobile-link"
            onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: isActive(link.to) ? 'var(--blue)' : 'var(--gray-400)' }}>
              {NAV_ICONS[link.to]}
            </span>
            {link.label}
          </Link>
        ))}
        {state.user?.role === 'admin' && (
          <Link to="/admin" className="nav-mobile-link" onClick={() => setMobileOpen(false)}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--gray-400)' }}>{NAV_ICONS['/admin']}</span>
            Admin Panel
          </Link>
        )}
        <hr style={{ borderColor: 'var(--gray-200)', margin: '10px 0' }} />
        {state.user ? (
          <button className="nav-mobile-link"
            style={{ background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--gray-500)', fontFamily: 'inherit' }}
            onClick={handleSignOut}>
            Sign Out
          </button>
        ) : (
          <Link to="/auth" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Sign In</Link>
        )}
      </div>

      <style>{`
        /* Standard flex layout for left-aligned links */
        .navbar-inner {
          display: flex !important;
          align-items: center !important;
          width: 100% !important;
          max-width: 1400px !important;
          margin: 0 auto !important;
          padding: 0 5vw !important;
          gap: 48px !important;
        }

        /* Brand */
        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
          margin-right: 0;
        }
        .nav-logo-box {
          width: 50px; height: 50px;
          background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%);
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(37,99,235,0.4);
          flex-shrink: 0;
        }
        .nav-brand-name {
          font-size: 1.35rem !important;
          font-weight: 800 !important;
        }
        .nav-brand-sub {
          font-size: 0.72rem !important;
        }

        /* Nav links — aligned next to brand */
        .nav-links {
          display: flex !important;
          align-items: center !important;
          justify-content: flex-start !important;
          gap: 12px !important;
          flex: 1 !important; /* Pushes right side to the edge */
        }
        .nav-link {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          font-size: 1.05rem !important;
          font-weight: 700 !important;
          color: var(--gray-600) !important;
          padding: 12px 20px !important;
          border-radius: 8px !important;
          transition: all 0.18s !important;
          white-space: nowrap !important;
          text-decoration: none !important;
          border-bottom: 2px solid transparent !important;
        }
        .nav-link:hover {
          color: var(--navy) !important;
          background: var(--navy-light) !important;
          border-bottom-color: var(--navy) !important;
        }
        .nav-link.active {
          color: var(--blue) !important;
          background: var(--blue-light) !important;
          border-bottom-color: var(--blue) !important;
        }
        .nav-link-icon {
          display: flex; align-items: center;
          opacity: 0.6;
          transition: opacity 0.18s;
        }
        .nav-link:hover .nav-link-icon,
        .nav-link.active .nav-link-icon { opacity: 1; }

        /* Right controls */
        .nav-right {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          justify-content: flex-end !important;
          margin-left: 0 !important;
        }
        .nav-points-chip {
          font-size: 0.95rem !important;
          padding: 10px 18px !important;
          white-space: nowrap !important;
        }
        .nav-sign-out {
          font-size: 0.98rem !important;
          padding: 12px 20px !important;
          white-space: nowrap !important;
        }
        .nav-sign-in {
          font-size: 0.98rem !important;
          padding: 12px 24px !important;
          white-space: nowrap !important;
        }
      `}</style>
    </>
  );
};

export default Navbar;
