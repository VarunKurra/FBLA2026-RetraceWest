import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, User, GraduationCap, MapPin, Search, ArrowRight, CheckCircle2, RefreshCw, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MISSOURI_SCHOOLS } from '../data/missouriSchools';
import { useNavigate } from 'react-router-dom';

import { supabase } from '../supabaseClient';

const Auth = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [step, setStep] = useState(1); // 1 = Role, 2 = Details (for signup)
    const [role, setRole] = useState(null);
    const [schoolSearch, setSchoolSearch] = useState('');
    const [selectedSchoolId, setSelectedSchoolId] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    React.useLayoutEffect(() => {
        if (state.user) navigate('/dashboard');
    }, [state.user, navigate]);

    // CAPTCHA State (For Signup only)
    const [captchaInput, setCaptchaInput] = useState('');
    const [captchaProblem, setCaptchaProblem] = useState({ a: 12, b: 5 });

    const filteredSchools = useMemo(() => {
        if (!schoolSearch) return MISSOURI_SCHOOLS.slice(0, 50);
        return MISSOURI_SCHOOLS.filter(s =>
            s.name.toLowerCase().includes(schoolSearch.toLowerCase()) ||
            s.city.toLowerCase().includes(schoolSearch.toLowerCase())
        );
    }, [schoolSearch]);

    const generateCaptcha = () => {
        setCaptchaProblem({
            a: Math.floor(Math.random() * 20) + 1,
            b: Math.floor(Math.random() * 20) + 1
        });
        setCaptchaInput('');
    };

    const handleLogin = async () => {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
            email, password
        });
        setLoading(false);
        if (error) {
            alert(error.message);
        } else {
            // Context will catch the session change, but we can actively set it:
            const meta = data.user.user_metadata;
            dispatch({ type: 'LOGIN', payload: { ...meta, id: data.user.id, email: data.user.email } });
            navigate('/dashboard');
        }
    };

    const verifyAndRegister = async () => {
        if (parseInt(captchaInput) !== captchaProblem.a + captchaProblem.b) {
            alert("Incorrect verification code. Please try again.");
            generateCaptcha();
            return;
        }

        setLoading(true);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name,
                    role,
                    schoolId: selectedSchoolId,
                    approved: role === 'student' // Auto-approve students
                }
            }
        });
        setLoading(false);

        if (error) {
            alert(error.message);
        } else {
            alert("Registration successful! Please log in.");
            setAuthMode('login');
        }
    };

    return (
        <div className="auth-v5">
            <div className="auth-shell">

                <AnimatePresence mode="wait">
                    {authMode === 'login' ? (
                        <motion.div
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="auth-card glass"
                        >
                            <div className="auth-header">
                                <div className="logo-circ">
                                    <Lock size={32} color="var(--color-primary)" />
                                </div>
                                <h1>Welcome Back</h1>
                                <p>Log in to access your campus network.</p>
                            </div>

                            <div className="form-body">
                                <div className="field">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Password</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn-primary full-width"
                                disabled={!email || !password || loading}
                                onClick={handleLogin}
                            >
                                {loading ? 'Logging in...' : 'Log In'} <ArrowRight size={18} />
                            </button>

                            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                                Don't have an account? <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthMode('signup')}>Sign Up</span>
                            </div>
                        </motion.div>
                    ) : (
                        authMode === 'signup' && step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="auth-card glass"
                            >
                                <div className="auth-header">
                                    <div className="logo-circ">
                                        <GraduationCap size={32} color="var(--color-primary)" />
                                    </div>
                                    <h1>Create an Account</h1>
                                    <p>Select your account type to join the Missouri recovery network.</p>
                                </div>

                                <div className="role-selector">
                                    <button
                                        className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                                        onClick={() => setRole('admin')}
                                    >
                                        <div className="icon-wrap"><Shield size={24} /></div>
                                        <div className="txt">
                                            <h3>Administrator</h3>
                                            <p>Manage school reports and verify local users.</p>
                                        </div>
                                    </button>

                                    <button
                                        className={`role-btn ${role === 'student' ? 'active' : ''}`}
                                        onClick={() => setRole('student')}
                                    >
                                        <div className="icon-wrap"><User size={24} /></div>
                                        <div className="txt">
                                            <h3>Student Login</h3>
                                            <p>Report lost items and view local recovered nodes.</p>
                                        </div>
                                    </button>
                                </div>

                                <button
                                    className="btn-primary full-width"
                                    disabled={!role}
                                    onClick={() => setStep(2)}
                                >
                                    Continue <ArrowRight size={18} />
                                </button>
                                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                                    Already have an account? <span style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setAuthMode('login')}>Log In</span>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="auth-card glass"
                            >
                                <div className="auth-header small">
                                    <div className="logo-circ small">
                                        <MapPin size={24} color="var(--color-primary)" />
                                    </div>
                                    <h1>Profile Setup</h1>
                                    <p>Enter your details and find your institution.</p>
                                </div>

                                <div className="form-body">
                                    <div className="field">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Alex Dawson"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div className="field">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                placeholder="Enter Email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Password</label>
                                            <input
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label>Your School or District</label>
                                        <div className="search-wrap">
                                            <Search className="s-icon" size={16} />
                                            <input
                                                type="text"
                                                placeholder="Search Missouri schools..."
                                                value={schoolSearch}
                                                onChange={e => setSchoolSearch(e.target.value)}
                                            />
                                        </div>
                                        <div className="school-list-scroll">
                                            {filteredSchools.map(s => (
                                                <button
                                                    key={s.id}
                                                    className={`school-item ${selectedSchoolId === s.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedSchoolId(s.id)}
                                                >
                                                    <div className="s-info">
                                                        <span className="s-name">{s.name}</span>
                                                        <span className="s-city">{s.city}, MO</span>
                                                    </div>
                                                    {selectedSchoolId === s.id && <CheckCircle2 size={16} color="var(--color-primary)" />}
                                                </button>
                                            ))}
                                            {filteredSchools.length === 0 && (
                                                <div className="no-res">No schools found for "{schoolSearch}"</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Secure Verification / Captcha */}
                                    <div className="field captcha-field">
                                        <label>Human Verification</label>
                                        <div className="captcha-box">
                                            <div className="problem">
                                                <span>{captchaProblem.a} + {captchaProblem.b} = </span>
                                                <input
                                                    className="captcha-input"
                                                    type="number"
                                                    value={captchaInput}
                                                    onChange={e => setCaptchaInput(e.target.value)}
                                                    placeholder="?"
                                                />
                                            </div>
                                            <button className="refresh-btn" onClick={generateCaptcha}>
                                                <RefreshCw size={14} />
                                            </button>
                                            {parseInt(captchaInput) === captchaProblem.a + captchaProblem.b && (
                                                <div className="solved-badge animate-fade"><CheckCircle2 size={16} /> Verified</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="auth-actions">
                                    <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
                                    <button
                                        className="btn-primary"
                                        disabled={!selectedSchoolId || !name || !email || !password || !captchaInput || loading}
                                        onClick={verifyAndRegister}
                                    >
                                        {loading ? 'Registering...' : 'Create Profile'}
                                    </button>
                                </div>
                            </motion.div>
                        )
                    )}
                </AnimatePresence>

            </div>

            <style jsx>{`
        .auth-v5 {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F8FAFC;
          background-image: 
            radial-gradient(at 0% 0%, rgba(37, 99, 235, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(99, 102, 241, 0.05) 0px, transparent 50%),
            linear-gradient(rgba(241, 245, 249, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(241, 245, 249, 0.5) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 40px 40px, 40px 40px;
          padding: 120px 20px 80px; /* Increased top padding for navbar clearance */
          overflow-y: auto;
        }
        .auth-shell { width: 100%; max-width: 580px; position: relative; z-index: 10; }

        .auth-card { 
          padding: 3rem; border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); background: white; 
          max-height: calc(100vh - 120px); overflow-y: auto;
        }

        @media (max-width: 640px) {
          .auth-card { padding: 1.5rem; }
          .auth-header h1 { font-size: 1.75rem; }
        }


        .auth-header { text-align: center; margin-bottom: 2.5rem; }
        .logo-circ { 
          width: 72px; height: 72px; background: #EEF2FF; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;
        }
        .logo-circ.small { width: 48px; height: 48px; margin-bottom: 1rem; }
        
        .auth-header h1 { font-size: 2.25rem; color: var(--color-dark); margin-bottom: 0.5rem; }
        .auth-header p { color: var(--text-dim); font-size: 1.1rem; max-width: 400px; margin: 0 auto; }

        .role-selector { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2.5rem; }
        .role-btn {
          display: flex; align-items: center; gap: 1.5rem; text-align: left;
          padding: 1.5rem; border-radius: var(--radius-lg); border: 2px solid #F1F5F9;
          background: #F8FAFC; transition: all 0.2s; cursor: pointer;
        }
        .role-btn:hover { border-color: var(--color-primary); background: #EEF2FF; }
        .role-btn.active { border-color: var(--color-primary); background: #EEF2FF; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08); }
        
        .icon-wrap { 
          width: 48px; height: 48px; background: white; border-radius: 12px;
          display: flex; align-items: center; justify-content: center; color: var(--color-primary);
          box-shadow: var(--shadow-sm);
        }
        .role-btn h3 { font-size: 1.1rem; color: var(--color-dark); margin-bottom: 0.25rem; }
        .role-btn p { font-size: 0.9rem; color: var(--text-dim); line-height: 1.4; }

        .form-body { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; }
        .field { display: flex; flex-direction: column; gap: 0.5rem; }
        .field label { font-size: 0.9rem; font-weight: 600; color: var(--color-dark); }
        
        .search-wrap { position: relative; }
        .s-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: var(--text-dim); }
        .search-wrap input { padding-left: 2.75rem; }

        .school-list-scroll { 
          height: 180px; overflow-y: auto; border: 1px solid var(--border-glass); 
          border-radius: var(--radius-md); margin-top: 0.5rem; background: #F8FAFC;
        }
        .school-item {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 1rem; border: none; border-bottom: 1px solid var(--border-glass);
          background: transparent; cursor: pointer; transition: background 0.2s;
        }
        .school-item:hover { background: rgba(0, 0, 0, 0.02); }
        .school-item.active { background: #EEF2FF; }
        .s-info { display: flex; flex-direction: column; text-align: left; }
        .s-name { font-weight: 600; font-size: 0.95rem; color: var(--color-dark); }
        .s-city { font-size: 0.8rem; color: var(--text-dim); }
        .no-res { padding: 2rem; text-align: center; color: var(--text-dim); font-size: 0.9rem; }

        .captcha-box { 
          display: flex; align-items: center; gap: 1rem; padding: 1rem; 
          background: #F1F5F9; border-radius: var(--radius-md); 
        }
        .problem { font-family: var(--font-mono); font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem; }
        .captcha-input { width: 80px !important; text-align: center; }
        .refresh-btn { background: white; border: 1px solid var(--border-glass); padding: 0.5rem; border-radius: 8px; cursor: pointer; }
        .solved-badge { display: flex; align-items: center; gap: 0.5rem; color: var(--color-secondary); font-size: 0.85rem; font-weight: 600; }

        .auth-actions { display: flex; gap: 1rem; }
        .auth-actions button { flex: 1; justify-content: center; }
        .full-width { width: 100%; justify-content: center; }
      `}</style>
        </div>
    );
};

export default Auth;
