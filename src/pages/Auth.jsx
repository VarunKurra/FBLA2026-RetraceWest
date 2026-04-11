import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, ArrowRight, AlertTriangle, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useApp, PARKWAY_WEST } from '../context/AppContext';
import { supabase } from '../supabaseClient';

const Auth = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [grade, setGrade] = useState('10');
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isAdminPortal, setIsAdminPortal] = useState(false);
  const [adminCode, setAdminCode] = useState('');

  const DEMO_MODE = !import.meta.env.VITE_SUPABASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!isAdminPortal && !email.toLowerCase().endsWith('@parkwayschools.net')) {
        throw new Error('You must use a valid @parkwayschools.net email address.');
      }

      if (isAdminPortal && isSignUp && adminCode !== 'ParkwayStaff') {
        throw new Error('Invalid Administrator Passcode.');
      }

      if (DEMO_MODE) {
        await new Promise(r => setTimeout(r, 800));
        const demoRole = isAdminPortal ? 'admin' : 'student';
        const fakeUser = {
          id: 'demo-user-1',
          email: email.toLowerCase(),
          firstName: isSignUp ? firstName : email.split('@')[0].split('.')[0] || (isAdminPortal ? 'Admin' : 'Demo'),
          lastName: isSignUp ? lastName : 'User',
          schoolId: PARKWAY_WEST.id,
          grade: parseInt(grade, 10),
          role: demoRole,
          points: 45,
        };
        dispatch({ type: 'LOGIN', payload: fakeUser });
        navigate(demoRole === 'admin' ? '/admin' : '/dashboard');
        return;
      }

      if (isSignUp) {
        if (!firstName || !lastName || (!isAdminPortal && !grade)) throw new Error('Please fill out all fields.');
        const targetRole = isAdminPortal ? 'admin' : 'student';
        const { data, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { first_name: firstName, last_name: lastName, grade: parseInt(grade, 10) || null, school_id: PARKWAY_WEST.id, role: targetRole } }
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setSuccessMsg('Account created! Check your email to confirm.');
          setLoading(false);
          return;
        }
        if (data.user) {
          dispatch({ type: 'LOGIN', payload: { id: data.user.id, email: data.user.email, firstName: data.user.user_metadata.first_name, lastName: data.user.user_metadata.last_name, schoolId: PARKWAY_WEST.id, grade: data.user.user_metadata.grade, role: targetRole, points: 0 } });
          navigate('/dashboard');
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        if (data.user) {
          const { data: profile } = await supabase.from('profiles').select('points, role').eq('id', data.user.id).single();
          const pRole = profile?.role || 'student';
          dispatch({ type: 'LOGIN', payload: { id: data.user.id, email: data.user.email, firstName: data.user.user_metadata.first_name || 'Student', lastName: data.user.user_metadata.last_name || '', schoolId: data.user.user_metadata.school_id || PARKWAY_WEST.id, grade: data.user.user_metadata.grade, role: pRole, points: profile?.points || 0 } });
          navigate(pRole === 'admin' ? '/admin' : '/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel — Branding */}
      <div className="auth-left">
        <div className="auth-left-inner">


          <div className="auth-left-hero">
            <h1>{isAdminPortal ? "Command Center Authentication." : "The official Lost\u00A0&\u00A0Found for Longhorns."}</h1>
            <p>{isAdminPortal ? "Secure login for system administrators to govern students, view metrics, and manage registry items." : "Sign in with your school account to report lost items, browse the live registry, and reclaim your belongings \u2014 fast."}</p>
          </div>

          <div className="auth-perks">
            {[
              { icon: <Shield size={20} />, title: 'School-Verified Only', desc: 'Protected by @parkwayschools.net authentication' },
              { icon: <Mail size={20} />, title: 'Instant Notifications', desc: 'Get alerted when your item is marked found' },
              { icon: <CheckCircle size={20} />, title: 'Admin-Verified Claims', desc: 'Every claim reviewed before release' },
            ].map((p, i) => (
              <div key={i} className="auth-perk">
                <div className="ap-icon">{p.icon}</div>
                <div>
                  <div className="ap-title">{p.title}</div>
                  <div className="ap-desc">{p.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {DEMO_MODE && (
            <div className="demo-banner">
              <AlertTriangle size={15} />
              <div>
                <strong>Demo Mode</strong> — Use any <code>@parkwayschools.net</code> email. Try <code>admin@parkwayschools.net</code> for admin access.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-header">
            <h2>{isSignUp ? 'Create your account' : (isAdminPortal ? 'Admin Sign In' : 'Welcome back, Longhorn')}</h2>
            <p>{isSignUp ? 'Join the West High RetraceWest network.' : 'Sign in to access the registry.'}</p>
          </div>

          {successMsg && (
            <div className="auth-success">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {isSignUp && isAdminPortal && (
              <div className="auth-field" style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <label>Administrator Passcode</label>
                <input type="password" placeholder="Enter the secure admin key required to sign up" value={adminCode} onChange={e => setAdminCode(e.target.value)} required />
              </div>
            )}

            {isSignUp && (
              <div className="form-row-2">
                <div className="auth-field">
                  <label>First Name</label>
                  <input type="text" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </div>
                <div className="auth-field">
                  <label>Last Name</label>
                  <input type="text" placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} required />
                </div>
              </div>
            )}

            <div className="auth-field">
              <label>School Email</label>
              <input type="email" placeholder="student@parkwayschools.net" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="pw-wrap">
                <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" className="pw-toggle" onClick={() => setShowPassword(v => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignUp && !isAdminPortal && (
              <div className="auth-field">
                <label>Grade Level</label>
                <select value={grade} onChange={e => setGrade(e.target.value)}>
                  <option value="9">Freshman (9th)</option>
                  <option value="10">Sophomore (10th)</option>
                  <option value="11">Junior (11th)</option>
                  <option value="12">Senior (12th)</option>
                </select>
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <span className="spin" style={{ display: 'inline-block', fontSize: '1.1rem' }}>⭘</span>
              ) : (
                <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          <div className="auth-switch">
            <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
            <button type="button" onClick={() => { setIsSignUp(v => !v); setError(null); setSuccessMsg(null); }}>
              {isSignUp ? 'Sign in' : 'Create one'}
            </button>
          </div>

          <div style={{ marginTop: 24, padding: '16px 0', borderTop: '1px solid var(--gray-200)', textAlign: 'center' }}>
            <button 
              type="button"
              className="btn-ghost" 
              style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}
              onClick={(e) => {
                e.preventDefault();
                setIsAdminPortal(!isAdminPortal);
                setError(null);
                setSuccessMsg(null);
                setAdminCode('');
              }}
            >
              <Shield size={14} style={{ display: 'inline', marginRight: 6, marginBottom: -2 }} />
              {isAdminPortal ? "Return to Student Portal" : "Administrator Portal"}
            </button>
          </div>

          <Link to="/" className="auth-back" style={{ marginTop: 4 }}>← Back to Home</Link>
        </div>
      </div>

      <style>{`
        .auth-page {
          display: flex;
          min-height: 100vh;
        }

        /* ── Left ── */
        .auth-left {
          flex: 1.1;
          background: var(--navy);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 56px;
          position: relative;
          overflow: hidden;
        }
        .auth-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 320px; height: 320px;
          background: var(--red);
          border-radius: 50%;
          opacity: 0.12;
        }
        .auth-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -60px;
          width: 240px; height: 240px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }
        .auth-left-inner {
          max-width: 480px;
          width: 100%;
          position: relative;
          z-index: 1;
        }

        .auth-logo-mark {
          width: 44px; height: 44px;
          background: var(--red);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; font-weight: 900; color: white;
        }
        .auth-logo-name {
          font-size: 1.4rem;
          font-weight: 900;
          color: white;
          line-height: 1.1;
        }
        .auth-logo-sub {
          font-size: 0.65rem;
          font-weight: 600;
          color: rgba(255,255,255,0.45);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .auth-left-hero h1 {
          font-size: clamp(1.8rem, 2.8vw, 2.6rem);
          font-weight: 900;
          color: white;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .auth-left-hero p {
          font-size: 1rem;
          color: rgba(255,255,255,0.65);
          line-height: 1.75;
          margin-bottom: 48px;
          max-width: 420px;
        }

        .auth-perks {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .auth-perk {
          display: flex;
          align-items: flex-start;
          gap: 16px;
        }
        .ap-icon {
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.8);
          flex-shrink: 0;
        }
        .ap-title {
          font-weight: 700;
          color: white;
          font-size: 0.9rem;
          margin-bottom: 3px;
        }
        .ap-desc {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.5);
          line-height: 1.5;
        }

        .demo-banner {
          margin-top: 48px;
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(178,34,52,0.25);
          border: 1px solid rgba(178,34,52,0.6);
          border-radius: 10px;
          padding: 14px 16px;
          color: rgba(255,255,255,0.8);
          font-size: 0.8rem;
          line-height: 1.6;
        }
        .demo-banner svg { margin-top: 2px; flex-shrink: 0; color: #fca5a5; }
        .demo-banner strong { color: white; display: block; margin-bottom: 2px; }
        .demo-banner code { background: rgba(255,255,255,0.1); padding: 1px 5px; border-radius: 4px; font-size: 0.78rem; }

        /* ── Right ── */
        .auth-right {
          flex: 0.9;
          background: #f8f9fb;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
        }
        .auth-form-box {
          width: 100%;
          max-width: 420px;
        }
        .auth-form-header {
          margin-bottom: 32px;
        }
        .auth-form-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--navy);
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .auth-form-header p {
          color: var(--gray-500);
          font-size: 0.9rem;
        }

        .auth-success {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f0fdf4;
          color: #166534;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
        }
        .auth-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 0.85rem;
          margin-bottom: 20px;
          line-height: 1.5;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .form-row-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }
        .auth-field label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--gray-700);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .auth-field input,
        .auth-field select {
          background: white;
          border: 1.5px solid var(--gray-200);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 0.95rem;
          color: var(--gray-900);
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
          font-family: inherit;
          width: 100%;
        }
        .auth-field input:focus,
        .auth-field select:focus {
          border-color: var(--navy);
          box-shadow: 0 0 0 3px rgba(27,42,74,0.1);
        }
        .auth-field input::placeholder { color: var(--gray-400); }

        .pw-wrap {
          position: relative;
        }
        .pw-wrap input {
          padding-right: 44px;
        }
        .pw-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gray-400);
          padding: 4px;
          display: flex;
        }
        .pw-toggle:hover { color: var(--navy); }

        .auth-submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          background: var(--red);
          color: white;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 1rem;
          font-weight: 700;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.15s, transform 0.1s;
          margin-top: 4px;
        }
        .auth-submit-btn:hover:not(:disabled) {
          background: var(--red-dark);
          transform: translateY(-1px);
        }
        .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .auth-switch {
          margin-top: 24px;
          text-align: center;
          font-size: 0.85rem;
          color: var(--gray-500);
        }
        .auth-switch button {
          background: none;
          border: none;
          color: var(--navy);
          font-weight: 700;
          font-size: 0.85rem;
          margin-left: 6px;
          cursor: pointer;
          padding: 0;
          font-family: inherit;
        }
        .auth-switch button:hover { text-decoration: underline; }

        .auth-back {
          display: block;
          text-align: center;
          margin-top: 24px;
          font-size: 0.82rem;
          color: var(--gray-400);
          text-decoration: none;
          transition: color 0.15s;
        }
        .auth-back:hover { color: var(--navy); }

        @media (max-width: 900px) {
          .auth-page { flex-direction: column; }
          .auth-left { padding: 48px 28px; }
          .auth-right { padding: 48px 24px; }
          .auth-logo { margin-bottom: 36px; }
          .auth-left-hero { margin-bottom: 32px; }
          .auth-left-hero h1 { font-size: 1.9rem; }
        }
        @media (max-width: 480px) {
          .form-row-2 { grid-template-columns: 1fr; }
          .auth-right { padding: 36px 20px; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
