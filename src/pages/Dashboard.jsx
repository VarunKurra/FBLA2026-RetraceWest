import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Package, Map as MapIcon, ShieldCheck, Clock,
    ChevronRight, PlusCircle, AlertCircle, CheckCircle,
    ArrowUpRight, Navigation, Trash2, Search, MapPin,
    ShieldAlert, Activity, Filter, MoreHorizontal, Check, X
} from 'lucide-react';

import { useApp } from '../context/AppContext';
import { MISSOURI_SCHOOLS } from '../data/missouriSchools';
import { useNavigate } from 'react-router-dom';

// only admins can really do much here, sorry students!
const Dashboard = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview'); // overview, management, audit
    const [searchTerm, setSearchTerm] = useState('');

    // gotta check if they're logged in first, obvs
    if (!state.user) {
        return (
            <div className="auth-barrier">
                <motion.div
                    className="auth-barrier-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="barrier-icon">
                        <AlertCircle size={42} />
                    </div>
                    <h2>Profile Not Found</h2>
                    <p>We couldn't locate your academic profile. Please sign in to access your school's secure recovery network.</p>
                    <button className="btn-primary" onClick={() => navigate('/auth')}>
                        Sign In Now <ArrowUpRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }


    const userSchool = MISSOURI_SCHOOLS.find(s => s.id === state.user?.schoolId);
    const myItems = Array.isArray(state.items) ? state.items.filter(item => item.schoolId === state.user?.schoolId && item.reporter === state.user?.name) : [];
    const waitlistIds = state.user?.waitlist || [];
    const waitlistItems = Array.isArray(state.items)
        ? state.items.filter(item => waitlistIds.includes(item.id))
        : [];

    const stats = state.user.role === 'admin' ? [
        { label: 'System Uptime', val: '99.9%', icon: <Activity />, color: '#8B5CF6' },
        { label: 'Pending Claims', val: '12', icon: <Clock />, color: '#F59E0B' },
        { label: 'Security Score', val: 'A+', icon: <ShieldCheck />, color: '#10B981' },
    ] : [
        { label: 'Active Reports', val: myItems.length, icon: <Package />, color: 'var(--color-primary)' },
        { label: 'Campus Users', val: '1.2k', icon: <Users />, color: 'var(--color-accent)' },
        { label: 'Success Rate', val: '84%', icon: <CheckCircle />, color: 'var(--color-secondary)' },
    ];

    const schoolItems = Array.isArray(state.items) ? state.items.filter(item => item.schoolId === state.user?.schoolId) : [];

    return (
        <div className="dash-v5 page-wrapper">
            <div className="container">
                <header className="dash-header-v5">
                    <div className="welcome">
                        <div className="school-pill">
                            <MapPin size={14} /> {userSchool?.name || 'Academic Network'}
                        </div>
                        <h1>Protocol Dashboard</h1>
                        <p>Authenticated as <span className="u-name">{state.user.name}</span> ({state.user.role})</p>
                    </div>

                    <div className="dash-actions">
                        <button className="btn-primary" onClick={() => navigate('/report')}>
                            <PlusCircle size={20} /> New Report
                        </button>
                    </div>
                </header>

                {state.user.role === 'admin' && !state.user.approved ? (
                    <div className="approval-wall glass animate-fade">
                        <div className="icon-main"><ShieldAlert size={48} /></div>
                        <h2>Authorization Required</h2>
                        <p>Your administrative credentials haven't been synchronized with the core network. Contact your regional coordinator for approval.</p>
                        <button className="btn-primary" onClick={() => dispatch({ type: 'APPROVE_ADMIN' })}>
                            Simulate Authorization
                        </button>
                    </div>
                ) : (
                    <div className="dash-layout-v5">
                        {/* sidebar for tabs, keeping it organized */}
                        <nav className="dash-tabs-v5 glass">
                            <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>
                                <Activity size={18} /> Overview
                            </button>
                            {state.user.role === 'admin' && (
                                <>
                                    <button className={activeTab === 'management' ? 'active' : ''} onClick={() => setActiveTab('management')}>
                                        <Package size={18} /> Catalog Moderation
                                    </button>
                                    <button className={activeTab === 'audit' ? 'active' : ''} onClick={() => setActiveTab('audit')}>
                                        <ShieldCheck size={18} /> Security Audit
                                    </button>
                                </>
                            )}
                            <button className={activeTab === 'waitlist' ? 'active' : ''} onClick={() => setActiveTab('waitlist')}>
                                <Clock size={18} /> My Registry
                            </button>
                        </nav>

                        <div className="dash-grid-v5">
                            <div className="dash-main-v5">
                                {activeTab === 'overview' && (
                                    <>
                                        <div className="stats-row-v5">
                                            {stats.map((s, idx) => (
                                                <div key={idx} className="stat-card-v5 glass">
                                                    <div className="s-ico" style={{ background: `${s.color}15`, color: s.color }}>{s.icon}</div>
                                                    <div className="s-data">
                                                        <span className="s-label">{s.label}</span>
                                                        <span className="s-val">{s.val}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="intel-sec-v5 glass">
                                            <div className="sec-header-v5">
                                                <div className="h-left">
                                                    <Sparkles size={18} color="var(--color-primary)" />
                                                    <h2>System Intelligence</h2>
                                                </div>
                                                <span className="live-status"><div className="pulse"></div> Live Monitor</span>
                                            </div>
                                            <div className="intel-grid">
                                                <div className="intel-card">
                                                    <strong>Search Precision</strong>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: '92%' }}></div></div>
                                                    <span>92% Neural Efficiency</span>
                                                </div>
                                                <div className="intel-card">
                                                    <strong>Recovery Velocity</strong>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: '78%' }}></div></div>
                                                    <span>Avg. 2.4 days to resolution</span>
                                                </div>
                                                <div className="intel-card">
                                                    <strong>Network Trust</strong>
                                                    <div className="bar-bg"><div className="bar-fill" style={{ width: '99%' }}></div></div>
                                                    <span>Verified Institutional Nodes</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="content-sec-v5 glass">
                                            <div className="sec-header-v5">
                                                <h2>{state.user.role === 'admin' ? 'Recent School Activity' : 'My Recovery Activity'}</h2>
                                                <button className="btn-text" onClick={() => navigate('/registry')}>Access Full Catalog <ArrowUpRight size={16} /></button>
                                            </div>
                                            <div className="list-v5">
                                                {(state.user.role === 'admin' ? schoolItems.slice(0, 5) : myItems).map(item => (
                                                    <div key={item.id} className="list-item-v5">
                                                        <div className={`tag-v5 ${item.type}`}>{item.type}</div>
                                                        <div className="item-info-v5">
                                                            <h3>{item.title}</h3>
                                                            <p>{item.location_name || item.location}</p>
                                                        </div>
                                                        <div className="item-meta-v5">
                                                            <span>{new Date(item.created_at || item.timestamp).toLocaleDateString()}</span>
                                                            <button className="btn-icon" onClick={() => {
                                                                dispatch({ type: 'SET_MAP_VIEW', payload: { center: item.coords, zoom: 18, selectedItem: item } });
                                                                navigate('/map');
                                                            }}>
                                                                <Navigation size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(state.user.role === 'admin' ? schoolItems : myItems).length === 0 && (
                                                    <div className="empty-v5">No active logs found for this sector.</div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'management' && state.user.role === 'admin' && (
                                    <div className="content-sec-v5 glass">
                                        <div className="sec-header-v5">
                                            <h2>Catalog Moderation Unit</h2>
                                            <div className="search-mini glass">
                                                <Search size={16} />
                                                <input placeholder="Filter inventory..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className="admin-table-v5">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Item System ID</th>
                                                        <th>Status</th>
                                                        <th>Reporter</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {schoolItems.filter(i => i.title.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                                                        <tr key={item.id}>
                                                            <td className="id-cell">
                                                                <strong>{item.title}</strong>
                                                                <span>{item.id.substring(0, 12)}...</span>
                                                            </td>
                                                            <td><div className={`tag-v5 ${item.type}`}>{item.type}</div></td>
                                                            <td>{item.reporter}</td>
                                                            <td>
                                                                <div className="table-actions">
                                                                    <button className="t-btn check" onClick={() => alert("Verification Protocol Initiated")} title="Resolve Item"><Check size={16} /></button>
                                                                    <button className="t-btn del" onClick={() => alert("System Removal Request Processed")} title="Delete Log"><Trash2 size={16} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'waitlist' && (
                                    <div className="content-sec-v5 glass">
                                        <div className="sec-header-v5">
                                            <h2>Personal Recovery Registry</h2>
                                        </div>
                                        <div className="list-v5">
                                            {waitlistItems.map(item => (
                                                <div key={item.id} className="list-item-v5">
                                                    <div className={`tag-v5 ${item.type}`}>{item.type}</div>
                                                    <div className="item-info-v5">
                                                        <h3>{item.title}</h3>
                                                        <p>Current Status: <strong style={{ color: 'var(--color-primary)' }}>{item.status || 'Active'}</strong></p>
                                                    </div>
                                                    <div className="item-meta-v5">
                                                        <button className="btn-icon" onClick={() => {
                                                            dispatch({ type: 'SET_MAP_VIEW', payload: { center: item.coords, zoom: 18, selectedItem: item } });
                                                            navigate('/map');
                                                        }}>
                                                            <Navigation size={18} />
                                                        </button>
                                                        <button className="btn-icon danger" onClick={() => dispatch({ type: 'TOGGLE_WAITLIST', payload: item.id })}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {waitlistItems.length === 0 && (
                                                <div className="empty-v5">Your saved registry is currently empty.</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <aside className="dash-side-v5">
                                <div className="profile-card-v5 glass">
                                    <div className="p-top">
                                        <div className="avatar">{(state.user?.name || 'U')[0]}</div>
                                        <div className="p-txt">
                                            <h3>{state.user?.name}</h3>
                                            <span className={`role-badge ${state.user.role}`}>{state.user.role.toUpperCase()}</span>
                                        </div>
                                    </div>
                                    <div className="p-details">
                                        <div className="p-row"><span>Institutional Node</span> <strong>{userSchool?.name || 'Academic Network'}</strong></div>
                                        <div className="p-row"><span>System Security</span> <strong>Level 2 Verified</strong></div>
                                        <div className="p-row"><span>Recovery Status</span> <strong>Active</strong></div>
                                    </div>
                                    <button className="btn-ghost full" onClick={() => { dispatch({ type: 'LOGOUT' }); navigate('/'); }}>Deauthenticate Session</button>
                                </div>

                                <div className="side-banner glass">
                                    <ShieldCheck size={28} color="var(--color-primary)" />
                                    <p>Your institutional access is secured via end-to-end recovery protocols.</p>
                                </div>
                            </aside>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .dash-header-v5 { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; }
                .school-pill { display: inline-flex; align-items: center; gap: 8px; background: white; padding: 6px 14px; border-radius: 30px; border: 1px solid var(--border-glass); font-size: 0.8rem; font-weight: 700; color: var(--color-primary); margin-bottom: 1rem; }
                .dash-header-v5 h1 { font-size: 2.5rem; letter-spacing: -0.04em; }
                .welcome p { color: var(--text-dim); }
                .u-name { color: var(--color-primary); font-weight: 700; }

                .dash-tabs-v5 { display: flex; gap: 10px; padding: 10px; border-radius: 20px; background: white; margin-bottom: 30px; border: 1px solid var(--border-glass); }
                .dash-tabs-v5 button { flex: 1; padding: 12px; border: none; background: transparent; border-radius: 12px; font-weight: 700; color: var(--text-dim); display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; }
                .dash-tabs-v5 button:hover { background: #F8FAFC; color: var(--color-primary); }
                .dash-tabs-v5 button.active { background: var(--color-dark); color: white; }

                .stats-row-v5 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
                .stat-card-v5 { padding: 20px; border-radius: 20px; background: white; display: flex; align-items: center; gap: 15px; border: 1px solid var(--border-glass); }
                .s-ico { width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
                .s-data { display: flex; flex-direction: column; }
                .s-label { font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; }
                .s-val { font-size: 1.5rem; font-weight: 900; }

                .content-sec-v5 { padding: 30px; border-radius: 24px; background: white; border: 1px solid var(--border-glass); }
                .sec-header-v5 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
                .sec-header-v5 h2 { font-size: 1.4rem; letter-spacing: -0.02em; }
                .btn-text { background: none; border: none; color: var(--color-primary); font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; }

                .list-v5 { display: flex; flex-direction: column; gap: 12px; }
                .list-item-v5 { display: flex; align-items: center; gap: 20px; padding: 15px; border-radius: 16px; background: #F8FAFC; transition: 0.2s; }
                .list-item-v5:hover { background: #F1F5F9; }
                .tag-v5 { padding: 5px 10px; border-radius: 6px; font-size: 0.65rem; font-weight: 900; background: #E2E8F0; text-transform: uppercase; }
                .tag-v5.lost { background: #FEE2E2; color: #EF4444; }
                .tag-v5.found { background: #DCFCE7; color: #10B981; }
                .item-info-v5 { flex: 1; }
                .item-info-v5 h3 { font-size: 1rem; margin-bottom: 2px; }
                .item-info-v5 p { font-size: 0.8rem; color: var(--text-dim); }
                .item-meta-v5 { display: flex; align-items: center; gap: 15px; font-size: 0.8rem; color: var(--text-dim); }
                .btn-icon { width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border-glass); background: white; color: var(--color-primary); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .btn-icon:hover { background: var(--color-primary); color: white; }
                .btn-icon.danger { color: #EF4444; }
                .btn-icon.danger:hover { background: #EF4444; }

                .admin-table-v5 { overflow-x: auto; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 12px; font-size: 0.75rem; text-transform: uppercase; color: var(--text-dim); border-bottom: 2px solid #F1F5F9; }
                td { padding: 15px 12px; border-bottom: 1px solid #F1F5F9; }
                .id-cell strong { display: block; font-size: 0.95rem; }
                .id-cell span { font-size: 0.75rem; color: var(--text-dim); font-family: var(--font-mono); }
                .table-actions { display: flex; gap: 8px; }
                .t-btn { width: 32px; height: 32px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
                .t-btn.check { background: #DCFCE7; color: #10B981; }
                .t-btn.del { background: #FEE2E2; color: #EF4444; }
                .t-btn:hover { transform: scale(1.1); }

                .search-mini { display: flex; align-items: center; gap: 10px; padding: 8px 15px; border-radius: 10px; background: #F8FAFC; border: 1px solid var(--border-glass); }
                .search-mini input { border: none; background: transparent; outline: none; font-size: 0.85rem; }

                .dash-side-v5 { display: flex; flex-direction: column; gap: 20px; }
                .profile-card-v5 { padding: 25px; border-radius: 24px; background: white; border: 1px solid var(--border-glass); }
                .p-top { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
                .avatar { width: 50px; height: 50px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; }
                .role-badge { font-size: 0.65rem; font-weight: 900; padding: 3px 8px; border-radius: 50px; }
                .role-badge.admin { background: #F5F3FF; color: #7C3AED; }
                .role-badge.student { background: #EFF6FF; color: #3B82F6; }
                .p-details { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
                .p-row { display: flex; justify-content: space-between; font-size: 0.85rem; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
                .p-row span { color: var(--text-dim); }
                .btn-ghost.full { width: 100%; padding: 12px; border-radius: 12px; }

                .approval-wall { text-align: center; padding: 60px; background: white; border-radius: 30px; box-shadow: var(--shadow-xl); max-width: 600px; margin: 40px auto; border: 1px solid var(--border-glass); }
                .icon-main { width: 80px; height: 80px; background: #FEE2E2; color: #EF4444; border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; }

                .dash-grid-v5 { display: grid; grid-template-columns: 1fr 320px; gap: 30px; }
                .dash-main-v5 { display: flex; flex-direction: column; gap: 30px; }

                .intel-sec-v5 { padding: 30px; border-radius: 24px; background: white; border: 1px solid var(--border-glass); }
                .sec-header-v5 .h-left { display: flex; align-items: center; gap: 12px; }
                .live-status { display: flex; align-items: center; gap: 8px; font-size: 0.75rem; font-weight: 800; color: #10B981; background: #DCFCE7; padding: 4px 12px; border-radius: 20px; }
                .pulse { width: 8px; height: 8px; background: #10B981; border-radius: 50%; box-shadow: 0 0 0 rgba(16, 185, 129, 0.4); animation: pulse 2s infinite; }
                @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

                .intel-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 25px; }
                .intel-card { background: #F8FAFC; padding: 20px; border-radius: 16px; border: 1px solid #F1F5F9; }
                .intel-card strong { display: block; font-size: 0.85rem; color: var(--color-dark); margin-bottom: 12px; }
                .bar-bg { height: 6px; background: #E2E8F0; border-radius: 10px; margin-bottom: 8px; overflow: hidden; }
                .bar-fill { height: 100%; background: var(--color-primary); border-radius: 10px; }
                .intel-card span { font-size: 0.7rem; color: var(--text-dim); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

                .side-banner { padding: 25px; border-radius: 24px; background: #F5F3FF; border: 1px solid #DDD6FE; display: flex; flex-direction: column; gap: 15px; }
                .side-banner p { font-size: 0.85rem; color: #6D28D9; font-weight: 600; line-height: 1.5; }

                @media (max-width: 1024px) {
                  .dash-layout-v5 { display: flex; flex-direction: column; }
                  .dash-grid-v5 { grid-template-columns: 1fr; }
                  .intel-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div >
    );
};

export default Dashboard;
