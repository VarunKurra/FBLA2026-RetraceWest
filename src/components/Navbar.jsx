import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { Globe, LayoutGrid, User, Map as MapIcon, Shield, Search, LogOut, PlusCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const navigate = useNavigate();


  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
    { path: '/registry', label: 'Item Catalog', icon: <Search size={18} /> },
    { path: '/map', label: 'Campus Map', icon: <MapIcon size={18} /> },
    { path: '/report', label: 'Report Item', icon: <PlusCircle size={18} /> },
  ];


  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };


  return (
    <nav className="nav-v5">
      <div className="container nav-inner">
        <Link to="/" className="nav-logo">
          Retrace<span>MO</span>
        </Link>

        <div className="nav-v5-links">
          {state.user ? navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-v5-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              <span className="n-ico">{link.icon}</span>
              <span className="n-lbl">{link.label}</span>
            </Link>
          )) : (
            <div className="nav-guest-links">
              <Link to="/" className="nav-v5-link">Home</Link>
              <Link to="/auth" className="nav-v5-link">Verify Identity</Link>
            </div>
          )}
        </div>


        <div className="nav-user">
          {state.user ? (
            <div className="user-nav-group">
              <div className={`user-chip`}>
                <div className="u-icon">
                  {state.user.role === 'admin' ? <Shield size={16} /> : <User size={16} />}
                </div>
                <div className="u-info">
                  <span className="u-name">{state.user.name}</span>
                  <span className="u-school">{(state.user.role || 'student').toUpperCase()}</span>
                </div>
              </div>
              <button className="logout-trigger" onClick={logout} title="Sign Out">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/auth" className="auth-trigger">School Portal Access</Link>
          )}
        </div>
      </div>

      <style jsx>{`
        .nav-v5 {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 84px;
          z-index: 8000;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.82);
          border-bottom: 1px solid var(--border-glass);
          backdrop-filter: blur(20px) saturate(180%);
        }
        .nav-inner { display: flex; justify-content: space-between; align-items: center; }
        
        .nav-logo { 
          font-family: var(--font-heading); font-size: 1.6rem; font-weight: 800; color: var(--color-dark); text-decoration: none; 
          letter-spacing: -0.03em;
        }
        .nav-logo span { color: var(--color-primary); }

        .nav-v5-links { display: flex; gap: 4px; align-items: center; background: rgba(0,0,0,0.03); padding: 5px; border-radius: 16px; }
        .nav-v5-link { 
          display: flex; align-items: center; gap: 8px; color: var(--text-dim); text-decoration: none; 
          font-size: 0.85rem; font-weight: 600; transition: all 0.2s;
          padding: 10px 16px; border-radius: 12px;
        }
        .nav-v5-link:hover { color: var(--color-primary); background: rgba(255,255,255,0.6); }
        .nav-v5-link.active { color: var(--color-primary); background: white; box-shadow: var(--shadow-sm); }
        .n-ico { display: flex; align-items: center; }


        .user-nav-group { display: flex; align-items: center; gap: 12px; }
        .user-chip { 
          display: flex; align-items: center; gap: 12px; padding: 6px 14px; border-radius: 12px;
          background: white; border: 1px solid var(--border-glass); box-shadow: var(--shadow-sm);
        }
        .u-icon { color: var(--color-primary); background: var(--color-primary-soft); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; }
        .u-info { display: flex; flex-direction: column; }
        .u-name { font-size: 0.85rem; font-weight: 700; color: var(--color-dark); }
        .u-school { font-size: 0.65rem; color: var(--text-dim); font-weight: 700; letter-spacing: 0.05em; }

        .logout-trigger {
          width: 40px; height: 40px; border-radius: 12px; border: 1px solid var(--border-glass);
          background: white; color: #EF4444; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .logout-trigger:hover { background: #FEE2E2; border-color: #EF4444; transform: scale(1.05); }

        .auth-trigger { 
          background: var(--color-dark); color: white; padding: 12px 24px; border-radius: 12px; 
          text-decoration: none; font-weight: 700; font-size: 0.9rem; transition: all 0.2s;
          box-shadow: var(--shadow-md);
        }

        .auth-trigger:hover { background: var(--color-primary); transform: translateY(-2px); box-shadow: var(--shadow-primary); }

        /* ── Responsive Navbar ── */
        @media (max-width: 1024px) {
          .nav-v5-link { padding: 8px 12px; }
          .n-lbl { font-size: 0.8rem; }
        }

        @media (max-width: 768px) {
          .nav-v5 { height: 64px; }
          .nav-v5-links {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid var(--border-glass);
            padding: 8px 12px;
            padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
            justify-content: space-around;
            z-index: 9000;
            box-shadow: 0 -4px 20px rgba(0,0,0,0.05);
            background: white; border-radius: 0;
          }
          .nav-v5-link { 
            flex-direction: column; gap: 4px; padding: 8px 12px; 
            font-size: 0.7rem; border-radius: 10px; flex: 1;
          }
          .nav-v5-link.active { background: var(--color-primary-soft); box-shadow: none; }
          .user-chip { padding: 4px 10px; border-radius: 10px; }
          .u-info { display: none; }
          .logout-trigger { width: 36px; height: 36px; border-radius: 10px; }
        }

        @media (max-width: 480px) {
          .nav-v5 { height: 56px; }
          .nav-logo { font-size: 1.3rem; }
          .n-lbl { display: none; }
          .nav-v5-link { padding: 12px; }
          .auth-trigger { padding: 10px 16px; font-size: 0.8rem; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
