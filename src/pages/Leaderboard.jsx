import React, { useEffect, useState } from 'react';
import { Trophy, Crown, Shield, ChevronRight, Zap, Target, Star, MailCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp, PARKWAY_WEST } from '../context/AppContext';

// stub leaderboard data
const DEMO_LEADERS = [
  { name: 'Jordan K.', role: 'student', points: 380, badge: 'Top Samaritan', items_returned: 12, rank: 1 },
  { name: 'Morgan T.', role: 'volunteer', points: 310, badge: 'Gold Helper', items_returned: 9, rank: 2 },
  { name: 'Alex R.', role: 'student', points: 260, badge: 'Silver Helper', items_returned: 7, rank: 3 },
  { name: 'Sam W.', role: 'student', points: 195, badge: 'Active Finder', items_returned: 6, rank: 4 },
  { name: 'Casey M.', role: 'student', points: 150, badge: 'Contributor', items_returned: 5, rank: 5 },
  { name: 'Reese J.', role: 'student', points: 120, badge: 'Contributor', items_returned: 4, rank: 6 },
  { name: 'Taylor B.', role: 'volunteer', points: 115, badge: 'Contributor', items_returned: 4, rank: 7 },
  { name: 'Drew L.', role: 'student', points: 80, badge: 'Newcomer', items_returned: 2, rank: 8 },
];

const rankColors = [
  '#b45309', // gold-ish (using bold tailwind orange-700)
  '#4b5563', // silver (gray-600)
  '#9a3412', // bronze (orange-800)
];

const Leaderboard = () => {
  const { state } = useApp();
  const [leaders, setLeaders] = useState(DEMO_LEADERS);
  const [applying, setApplying] = useState(false);
  const [reason, setReason] = useState('');
  const [appSubmitted, setAppSubmitted] = useState(false);

  useEffect(() => {
    import('../supabaseClient').then(({ supabase }) => {
      supabase
        .from('profiles')
        .select('id, first_name, last_name, role, points')
        .order('points', { ascending: false })
        .limit(20)
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            const mapped = data.map((p, i) => ({
              id: p.id,
              name: `${p.first_name || 'Anonymous'} ${(p.last_name || '').charAt(0)}.`,
              role: p.role || 'student',
              points: p.points || 0,
              rank: i + 1,
              badge: i === 0 ? 'Top Samaritan' : i <= 2 ? 'Gold Helper' : i <= 5 ? 'Active Finder' : 'Contributor',
              items_returned: Math.floor((p.points || 0) / 25),
            }));
            if (mapped.length > 0) setLeaders(mapped);
          }
        });
    });
  }, []);

  const userRank = state.user
    ? leaders.findIndex(l => l.id === state.user.id || l.name.startsWith(state.user.firstName)) + 1
    : -1;

  const handleApply = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('volunteer_applications').insert({
        user_id: state.user?.id,
        name: `${state.user?.firstName} ${state.user?.lastName}`,
        reason: reason.trim(),
        status: 'pending',
      });
    } catch (err) {
      console.log('Volunteer application insert:', err.message);
    }
    setAppSubmitted(true);
    setApplying(false);
  };

  return (
    <div className="lb-page page-wrapper">
      
      {/* ── Header ── */}
      <section className="lb-header">
        <div className="container" style={{ textAlign: 'center', maxWidth: 720 }}>
          <div className="section-label centered" style={{ justifyContent: 'center' }}>
            Good Samaritan System
          </div>
          <h1 style={{ marginBottom: 16 }}>Longhorn Leaderboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '1.05rem', lineHeight: 1.7 }}>
            Earn points by returning found items and submitting quality reports.
            Top contributors are recognized by West High administration.
          </p>
        </div>
      </section>

      <section className="section-pad" style={{ paddingTop: 0 }}>
        <div className="container">
          
          <div className="lb-grid">
            
            {/* Left Col: Ranks */}
            <div className="lb-main-col">
              
              {/* Podium */}
              <div className="podium-row">
                {leaders.slice(0, 3).map((leader, i) => (
                  <div key={i} className={`podium-card rank-${i + 1}`}>
                    <div className="pc-rank-badge" style={{ background: rankColors[i] }}>
                      #{i + 1}
                    </div>
                    <div className="pc-avatar">
                      {leader.name.charAt(0)}
                    </div>
                    <div className="pc-name">{leader.name}</div>
                    <div className="pc-pts">{leader.points} pts</div>
                    <div className="pc-items">{leader.items_returned} returns</div>
                  </div>
                ))}
              </div>

              {/* Full List */}
              <div className="content-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-200)', background: 'var(--gray-50)' }}>
                  <h3 style={{ margin: 0 }}>Full Rankings</h3>
                </div>
                <div className="lb-table">
                  {leaders.map((leader, i) => (
                    <div key={i} className={`lb-tr ${leader.id === state.user?.id ? 'is-me' : ''}`}>
                      <div className="lb-td rank-col">
                        <span className="rank-num">#{leader.rank}</span>
                      </div>
                      <div className="lb-td avatar-col">
                        <div className="sm-avatar">{leader.name.charAt(0)}</div>
                      </div>
                      <div className="lb-td name-col">
                        <div className="name-bold">
                          {leader.name}
                          {leader.id === state.user?.id && <span className="you-tag">You</span>}
                        </div>
                        <div className="name-sub">{leader.badge}</div>
                      </div>
                      <div className="lb-td role-col">
                        {leader.role === 'volunteer' ? (
                          <span className="role-tag vol"><Shield size={12}/> Volunteer</span>
                        ) : (
                          <span className="role-tag stu">Student</span>
                        )}
                      </div>
                      <div className="lb-td pts-col">
                        <strong>{leader.points}</strong> pts
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Col: Info & My Rank */}
            <div className="lb-side-col">
              
              {/* My Rank */}
              {state.user ? (
                <div className="content-card" style={{ borderTop: '4px solid var(--navy)', marginBottom: 24 }}>
                  <h3 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--gray-500)', letterSpacing: '0.05em', marginBottom: 12 }}>
                    Your Standing
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1, color: 'var(--navy)' }}>
                        {state.user.points ?? 0}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-400)', marginTop: 4 }}>
                        TOTAL POINTS
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--red)' }}>
                        {userRank > 0 ? `#${userRank}` : '---'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                        board rank
                      </div>
                    </div>
                  </div>
                  <Link to="/report" className="btn-navy" style={{ width: '100%', justifyContent: 'center' }}>
                    Report to earn points <ChevronRight size={16} />
                  </Link>
                </div>
              ) : (
                <div className="content-card" style={{ marginBottom: 24, background: 'var(--gray-50)' }}>
                  <h3 style={{ marginBottom: 12 }}>Join the Board</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 16 }}>
                    Sign in to track your points and compete on the leaderboard.
                  </p>
                  <Link to="/auth" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Sign In <ChevronRight size={16} />
                  </Link>
                </div>
              )}

              {/* Point Guide */}
              <div className="content-card" style={{ marginBottom: 24 }}>
                <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} /> Point System
                </h3>
                <div className="point-rules">
                  <div className="pr-row">
                    <span>Found Item Report</span>
                    <strong style={{ color: '#16a34a' }}>+10</strong>
                  </div>
                  <div className="pr-row">
                    <span>Lost Item Report</span>
                    <strong style={{ color: 'var(--navy)' }}>+5</strong>
                  </div>
                  <div className="pr-row">
                    <span>Claim Verified</span>
                    <strong style={{ color: '#16a34a' }}>+25</strong>
                  </div>
                  <div className="pr-row">
                    <span>False Claim</span>
                    <strong style={{ color: 'var(--red)' }}>-15</strong>
                  </div>
                </div>
              </div>

              {/* Volunteer */}
              {state.user && !applying && !appSubmitted && (
                <div className="content-card" style={{ background: 'var(--navy)', color: 'var(--white)', borderColor: 'var(--navy)' }}>
                  <Shield size={24} style={{ marginBottom: 16, color: 'var(--red)' }} />
                  <h3 style={{ color: 'var(--white)', marginBottom: 8 }}>Student Volunteer</h3>
                  <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 16 }}>
                    Help manage claims and get recognized by administration.
                  </p>
                  <button className="btn-primary" style={{ background: 'var(--white)', color: 'var(--navy)', width: '100%', justifyContent: 'center' }} onClick={() => setApplying(true)}>
                    Apply Now
                  </button>
                </div>
              )}

              {applying && !appSubmitted && (
                <div className="content-card" style={{ border: '2px solid var(--navy)' }}>
                  <h3 style={{ marginBottom: 12 }}>Volunteer App</h3>
                  <form onSubmit={handleApply}>
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <textarea
                        rows={4}
                        placeholder="Why do you want to volunteer?"
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        required
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="btn-ghost" style={{ flex: 1, padding: '8px' }} onClick={() => setApplying(false)}>Cancel</button>
                      <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px', justifyContent: 'center' }}>Submit</button>
                    </div>
                  </form>
                </div>
              )}

              {appSubmitted && (
                <div className="content-card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <h3 style={{ color: '#166534', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <MailCheck size={18} /> App Sent
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#15803d' }}>
                    Your application is pending admin review.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      <style>{`
        .lb-header { padding: 64px 0 48px; border-bottom: 1px solid var(--gray-200); margin-bottom: 48px; }
        
        .lb-grid {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 40px;
          align-items: start;
        }

        /* Podium */
        .podium-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          align-items: end;
          margin-bottom: 32px;
        }
        .podium-card {
          background: var(--white);
          border: 1px solid var(--gray-200);
          border-radius: var(--r-lg);
          padding: 32px 16px 20px;
          text-align: center;
          position: relative;
        }
        .podium-card.rank-1 { border: 2px solid var(--navy); border-top-width: 6px; padding-top: 40px; }
        .pc-rank-badge {
          position: absolute;
          top: -12px; left: 50%; transform: translateX(-50%);
          color: white;
          padding: 4px 12px;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 800;
        }
        .pc-avatar {
          width: 56px; height: 56px;
          background: var(--gray-100);
          color: var(--navy);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.4rem; font-weight: 800;
          margin: 0 auto 12px;
        }
        .pc-name { font-weight: 700; color: var(--navy); margin-bottom: 4px; }
        .pc-pts { font-size: 1.2rem; font-weight: 800; color: var(--red); margin-bottom: 4px; }
        .pc-items { font-size: 0.75rem; color: var(--gray-500); }

        /* Table */
        .lb-table { display: flex; flex-direction: column; }
        .lb-tr {
          display: flex;
          align-items: center;
          padding: 12px 24px;
          border-bottom: 1px solid var(--gray-100);
        }
        .lb-tr:last-child { border-bottom: none; }
        .lb-tr.is-me { background: var(--red-light); }
        .lb-td { display: flex; align-items: center; }
        .rank-col { width: 48px; flex-shrink: 0; }
        .rank-num { font-weight: 700; color: var(--gray-400); font-size: 0.9rem; }
        .avatar-col { width: 48px; flex-shrink: 0; }
        .sm-avatar {
          width: 32px; height: 32px; background: var(--gray-200); color: var(--gray-700);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.8rem;
        }
        .name-col { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .name-bold { font-weight: 600; color: var(--navy); font-size: 0.9rem; display: flex; align-items: center; gap: 8px; }
        .name-sub { font-size: 0.75rem; color: var(--gray-500); }
        .you-tag { background: var(--red); color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; font-weight: 800; text-transform: uppercase; }
        .role-col { width: 100px; flex-shrink: 0; }
        .role-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 700; padding: 4px 8px; border-radius: 4px; }
        .role-tag.vol { background: #fef3c7; color: #b45309; }
        .role-tag.stu { background: var(--gray-100); color: var(--gray-600); }
        .pts-col { width: 80px; flex-shrink: 0; justify-content: flex-end; font-size: 0.9rem; color: var(--gray-600); }
        .pts-col strong { color: var(--navy); margin-right: 4px; font-size: 1rem; }

        /* Point Rules */
        .point-rules { display: flex; flex-direction: column; gap: 12px; }
        .pr-row { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; border-bottom: 1px dashed var(--gray-200); padding-bottom: 8px; }
        .pr-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pr-row span { color: var(--gray-600); }

        @media (max-width: 900px) {
          .lb-grid { grid-template-columns: 1fr; }
          .lb-side-col { order: -1; }
          .podium-row { grid-template-columns: 1fr; gap: 12px; }
          .podium-card.rank-1 { order: -1; }
          .role-col { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Leaderboard;
