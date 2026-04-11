import React, { useEffect, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Shield, Medal, CheckCircle, Package, ArrowRight, Clock, Clock4, Compass, Star } from 'lucide-react';
import { useApp, PARKWAY_WEST } from '../context/AppContext';



const Dashboard = () => {
  const { state } = useApp();
  const [claims, setClaims] = useState([]);
  const [recentFound, setRecentFound] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user) return;
    const fetchData = async () => {
      try {
        const { supabase } = await import('../supabaseClient');
        const { data: claimsData, error: claimsError } = await supabase
          .from('claims')
          .select('*')
          .eq('user_id', state.user.id)
          .order('created_at', { ascending: false });
        if (!claimsError && claimsData) setClaims(claimsData);

        const { data: recentData } = await supabase
          .from('items')
          .select('*')
          .eq('type', 'found')
          .order('created_at', { ascending: false })
          .limit(10);
        if (recentData) setRecentFound(recentData);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [state.user]);

  if (!state.user) return <Navigate to="/auth" />;

  const { firstName, role, points = 0 } = state.user;

  // Derive points tier
  let tier = 'Longhorn';
  let nextTierThreshold = 50;
  if (points >= 200) { tier = 'Gold Pillar'; nextTierThreshold = null; }
  else if (points >= 100) { tier = 'Silver Pillar'; nextTierThreshold = 200; }
  else if (points >= 50) { tier = 'Bronze Pillar'; nextTierThreshold = 100; }
  const progressToNext = nextTierThreshold ? (points / nextTierThreshold) * 100 : 100;

  return (
    <div className="dash-pw page-wrapper">
      
      {/* ── Header ── */}
      <section className="dash-header">
        <div className="container">
          <div className="dh-inner">
            <div className="dh-left">
              <span className="section-label" style={{ color: 'var(--white)' }}>
                <span className="dh-marker" /> Student Dashboard
              </span>
              <h1>Welcome back, {firstName}</h1>
              <p>Parkway West High School • {role === 'admin' ? 'Administrator' : 'Student'}</p>
            </div>
            {role === 'admin' && (
              <div className="dh-right">
                <Link to="/admin" className="btn-primary" style={{ background: 'var(--white)', color: 'var(--navy)', border: 'none' }}>
                  Open Admin Panel <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="section-pad-sm">
        <div className="container">
          <div className="dash-grid">
            
            {/* Left Column */}
            <div className="dash-col-main">
              
              <div className="section-title-row">
                <h2>Your Claims</h2>
                <Link to="/registry" className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Browse Registry
                </Link>
              </div>

              {claims.length === 0 ? (
                <div className="empty-state-placeholders">
                  {[
                    { title: 'Blue TI-84 Calculator', location: 'Library, 2nd Floor', status: 'pending', date: 'Dec 10' },
                    { title: 'Black Nike Hoodie', location: 'Main Gym', status: 'approved', date: 'Dec 8' },
                  ].map((item, num) => (
                    <div key={num} className="content-card claim-card demo-card">
                      <div className="cc-header">
                        <div className="cc-status">
                          {item.status === 'pending' && <span className="status-badge pending"><Clock4 size={12}/> Pending Review</span>}
                          {item.status === 'approved' && <span className="status-badge approved"><CheckCircle size={12}/> Approved</span>}
                        </div>
                        <div className="cc-date">{item.date}</div>
                      </div>
                      <div className="cc-item-info">
                        <h4>{item.title}</h4>
                        <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--gray-300)' }}/> {item.location}
                        </p>
                      </div>
                      <div className="demo-badge">Sample</div>
                    </div>
                  ))}
                  <p style={{ textAlign: 'center', color: 'var(--gray-400)', marginTop: 16, fontSize: '0.9rem' }}>
                    You haven't claimed any found items yet. Browse the registry to search for your belongings.
                  </p>
                </div>
              ) : (
                <div className="claim-list">
                  {claims.map(claim => (
                    <div key={claim.id} className="content-card claim-card">
                      <div className="cc-header">
                        <div className="cc-status">
                          {claim.status === 'pending' && <span className="status-badge pending"><Clock4 size={12} /> Pending Review</span>}
                          {claim.status === 'approved' && <span className="status-badge approved"><CheckCircle size={12} /> Approved</span>}
                          {claim.status === 'rejected' && <span className="status-badge rejected">Rejected</span>}
                        </div>
                        <div className="cc-date">{new Date(claim.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="cc-item-info">
                        <h4>{claim.item_title}</h4>
                        <p>Claim ID: #{claim.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="section-title-row" style={{ marginTop: 48 }}>
                <h2>Recent Found Items</h2>
                <Link to="/registry?type=found" className="btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  View All
                </Link>
              </div>
              
              <div className="claim-list">
                {recentFound.length > 0 ? recentFound.map((item, idx) => (
                  <div key={item.id || idx} className="content-card claim-card hover-lift">
                    <div className="cc-header">
                      <div className="cc-status">
                        <span className="status-badge approved"><Compass size={12} /> {item.category || 'Other'}</span>
                      </div>
                      <div className="cc-date">{new Date(item.created_at || Date.now()).toLocaleDateString()}</div>
                    </div>
                    <div className="cc-item-info">
                      <h4>{item.title || 'Unknown Item'}</h4>
                      <p style={{ color: 'var(--red)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12}/> Seen by {item.reporter || 'Student'}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="empty-state-placeholders">
                    {[
                      { title: 'HP Laptop Charger', category: 'Electronics',    reporter: 'Alex M.',   loc: 'B-Hall' },
                      { title: 'Car Keys — Honda',  category: 'Keys / IDs',     reporter: 'Jordan K.', loc: 'Parking Lot A' },
                      { title: 'Gray Patagonia Jacket', category: 'Clothing',   reporter: 'Taylor S.', loc: 'Commons' },
                    ].map((item, num) => (
                      <div key={num} className="content-card claim-card demo-card hover-lift">
                        <div className="cc-header">
                          <div className="cc-status">
                            <span className="status-badge found-badge"><Compass size={12}/> {item.category}</span>
                          </div>
                          <div className="cc-date">Today</div>
                        </div>
                        <div className="cc-item-info">
                          <h4>{item.title}</h4>
                          <p style={{ color: 'var(--gray-500)', fontSize: '0.82rem', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12}/> Reported by {item.reporter} · {item.loc}
                          </p>
                        </div>
                        <div className="demo-badge">Sample</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="section-title-row" style={{ marginTop: 48 }}>
                <h2>Campus Hotspots</h2>
              </div>
              <div className="content-card hotspot-card">
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: 20 }}>
                  Most commonly reported loss locations over the past 30 days.
                </p>
                <div className="hotspot-list">
                  {[
                    { loc: 'Library', ct: 14, pct: 90 },
                    { loc: 'Commons', ct: 11, pct: 70 },
                    { loc: 'Main Gym', ct: 8, pct: 50 },
                  ].map((h, i) => (
                    <div key={i} className="hs-row">
                      <span className="hs-name">{h.loc}</span>
                      <div className="bar-bg" style={{ flex: 1, backgroundColor: 'var(--gray-100)' }}>
                        <div className="bar-fill-navy" style={{ width: `${h.pct}%` }} />
                      </div>
                      <span className="hs-ct">{h.ct} items</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="dash-col-side">
              
              {/* Points Card */}
              <div className="content-card points-card">
                <div className="pc-top">
                  <div className="pc-icon"><Medal size={24} /></div>
                  <div className="pc-score">
                    <span className="val">{points}</span>
                    <span className="lbl">PTS</span>
                  </div>
                </div>
                <h3 style={{ marginTop: 16 }}>Good Samaritan</h3>
                <p className="pc-tier">Current Rank: <strong>{tier}</strong></p>
                
                {nextTierThreshold && (
                  <div className="pc-progress">
                    <div className="pcp-labels">
                      <span>Progress to {nextTierThreshold} pts</span>
                      <span>{Math.round(progressToNext)}%</span>
                    </div>
                    <div className="bar-bg"><div className="bar-fill" style={{ width: `${progressToNext}%` }} /></div>
                  </div>
                )}
                <div className="pc-actions">
                  <Link to="/leaderboard" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                    View Leaderboard
                  </Link>
                </div>
              </div>

              {/* Actions Card */}
              <div className="content-card actions-card" style={{ marginTop: 24 }}>
                <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>
                <div className="qa-list">
                  <Link to="/report" className="qa-btn">
                    <div className="qa-icon" style={{ color: 'var(--red)', background: 'var(--red-light)' }}>
                      <CheckCircle size={18} />
                    </div>
                    <div className="qa-text">
                      <div className="qat-title">Report an Item</div>
                      <div className="qat-desc">Lost or found something?</div>
                    </div>
                  </Link>
                  <Link to="/registry" className="qa-btn">
                    <div className="qa-icon" style={{ color: 'var(--navy)', background: 'rgba(27,42,74,0.1)' }}>
                      <Compass size={18} />
                    </div>
                    <div className="qa-text">
                      <div className="qat-title">Browse Registry</div>
                      <div className="qat-desc">Search current campus items</div>
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Header */
        .dash-header {
          background: var(--navy);
          padding: 32px 0 36px;
          border-bottom: 4px solid var(--red);
        }
        .dh-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
        }
        .dh-marker {
          display: inline-block; width: 12px; height: 12px; background: #22c55e; border-radius: 50%;
        }
        .dh-left h1 { color: var(--white); margin: 8px 0 4px; font-size: 2.2rem; }
        .dh-left p { color: rgba(255,255,255,0.7); font-size: 0.95rem; }

        /* Grid */
        .dash-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 48px;
          align-items: start;
        }
        
        .section-title-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        /* Empty State */
        .empty-state { text-align: center; padding: 48px 24px; }
        .es-icon { width: 56px; height: 56px; background: var(--gray-100); color: var(--gray-400); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .empty-state h3 { font-size: 1.1rem; color: var(--navy); margin-bottom: 6px; }
        .empty-state p { color: var(--gray-500); font-size: 0.9rem; max-width: 280px; margin: 0 auto; }

        /* Claims */
        .claim-list { display: flex; flex-direction: column; gap: 16px; }
        .cc-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
        .status-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 50px; }
        .status-badge.pending { background: #fef3c7; color: #b45309; }
        .status-badge.approved { background: #dcfce7; color: #166534; }
        .status-badge.rejected { background: #fee2e2; color: #991b1b; }
        .cc-date { font-size: 0.8rem; color: var(--gray-400); }
        .cc-item-info h4 { font-size: 1.05rem; font-weight: 700; color: var(--navy); }
        .cc-item-info p { font-size: 0.8rem; color: var(--gray-500); margin-top: 4px; }

        /* Demo placeholder styling */
        .demo-card { position: relative; opacity: 0.9; border: 1px dashed var(--gray-300) !important; padding-top: 40px !important; }
        .demo-badge {
          position: absolute; top: 10px; right: 12px;
          font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;
          background: var(--gray-100); color: var(--gray-400); padding: 3px 8px;
          border-radius: 20px;
        }
        .status-badge.found-badge { background: #dbeafe; color: #1d4ed8; }

        /* Hotspots */
        .hotspot-list { display: flex; flex-direction: column; gap: 12px; }
        .hs-row { display: flex; align-items: center; gap: 16px; }
        .hs-name { font-size: 0.85rem; font-weight: 700; color: var(--navy); min-width: 80px; }
        .hs-ct { font-size: 0.8rem; color: var(--gray-500); min-width: 50px; text-align: right; }

        /* Points Card */
        .points-card { background: var(--gray-50); border: 1px solid var(--gray-200); position: relative; overflow: hidden; }
        .points-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: var(--red); }
        .pc-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .pc-icon { width: 48px; height: 48px; background: var(--white); color: var(--red); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); }
        .pc-score { display: flex; flex-direction: column; align-items: flex-end; }
        .pc-score .val { font-size: 2.2rem; font-weight: 900; line-height: 1; color: var(--navy); }
        .pc-score .lbl { font-size: 0.75rem; font-weight: 700; color: var(--gray-400); }
        .pc-tier { font-size: 0.9rem; color: var(--gray-600); margin: 6px 0 20px; }
        .pcp-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray-500); font-weight: 600; margin-bottom: 6px; }
        .pc-actions { margin-top: 24px; }

        /* Quick Actions */
        .qa-list { display: flex; flex-direction: column; gap: 8px; }
        .qa-btn { display: flex; gap: 16px; padding: 12px; border-radius: var(--r-md); transition: background 0.15s; }
        .qa-btn:hover { background: var(--gray-50); }
        .qa-icon { width: 36px; height: 36px; border-radius: var(--r-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .qat-title { font-weight: 700; font-size: 0.9rem; color: var(--navy); margin-bottom: 2px; }
        .qat-desc { font-size: 0.75rem; color: var(--gray-500); }

        @media (max-width: 900px) {
          .dash-grid { grid-template-columns: 1fr; }
          .dash-col-side { order: -1; }
          .dh-inner { flex-direction: column; align-items: flex-start; }
        }
        /* Placeholders */
        .placeholder-card { opacity: 0.5; pointer-events: none; }
        .skeleton-box { background: var(--gray-200); border-radius: 4px; display: inline-block; animation: pulse 1.5s infinite ease-in-out; }
        @keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

      `}</style>
    </div>
  );
};

export default Dashboard;
