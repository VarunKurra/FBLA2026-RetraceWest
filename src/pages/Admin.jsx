import React, { useState, useEffect } from 'react';
import {
  BarChart3, Map as MapIcon, Shield, Users, CheckCircle, X, Clock,
  TrendingUp, Package, Search, AlertTriangle, FileText,
  Layers, Star, RefreshCw, Settings, Ban, UserCheck, Heart, Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: <BarChart3 size={17} /> },
  { id: 'heatmap', label: 'Heat Zone', icon: <MapIcon size={17} /> },
  { id: 'moderation', label: 'Moderation', icon: <Shield size={17} /> },
  { id: 'students', label: 'Students', icon: <Users size={17} /> },
  { id: 'volunteers', label: 'Volunteers', icon: <Heart size={17} /> },
];

// Correct Parkway West High School coordinates
const SCHOOL_CENTER = [38.6228, -90.5347];
const SCHOOL_RADIUS_METERS = 400;

// ── Placeholder data for when Supabase returns empty ──
const PLACEHOLDER_STATS = {
  total: 47, active: 29, resolved: 14, todayCount: 6, lost: 22, found: 25,
  topCategories: [['Electronics', 14], ['Accessories', 10], ['Clothing', 8], ['Keys / IDs', 7], ['Jewelry', 4], ['School Supplies', 4]],
};

const PLACEHOLDER_CLAIMS = [
  { id: 'clm-001', status: 'pending', description: 'I can describe the sticker on the back — it\'s a small red heart.',
    items: { title: 'AirPods Pro (White Case)', type: 'lost', location_name: 'Library / Media Center' },
    profiles: { first_name: 'Alex', last_name: 'Martinez', email: 'alex.martinez@parkwayschools.net' },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'clm-002', status: 'pending', description: 'It has my name written on the back in sharpie — "Taylor".',
    items: { title: 'TI-84 Plus Graphing Calculator', type: 'lost', location_name: 'C-Hall (near C204)' },
    profiles: { first_name: 'Taylor', last_name: 'Reynolds', email: 'taylor.reynolds@parkwayschools.net' },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { id: 'clm-003', status: 'approved', description: 'The North Face backpack has a blue star keychain.',
    items: { title: 'Grey North Face Backpack', type: 'lost', location_name: 'Main Gymnasium' },
    profiles: { first_name: 'Sam', last_name: 'Washington', email: 'sam.washington@parkwayschools.net' },
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'clm-004', status: 'pending', description: 'MacBook Air space gray with a dent on the right corner. Serial number starts with C02.',
    items: { title: 'MacBook Air (Space Gray)', type: 'lost', location_name: 'B-Hall — Outside B101' },
    profiles: { first_name: 'Chris', last_name: 'Park', email: 'chris.park@parkwayschools.net' },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'clm-005', status: 'rejected', description: 'It\'s a ring with initials M.K. on the inside.',
    items: { title: 'Silver Ring with Initials', type: 'found', location_name: 'Aux Gym — Near Locker Room' },
    profiles: { first_name: 'Morgan', last_name: 'Kim', email: 'morgan.kim@parkwayschools.net' },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

const PLACEHOLDER_STUDENTS = [
  { id: 'stud-001', first_name: 'Alex', last_name: 'Martinez', email: 'alex.martinez@parkwayschools.net', role: 'student', points: 85, status: 'active', grade: 11 },
  { id: 'stud-002', first_name: 'Taylor', last_name: 'Reynolds', email: 'taylor.reynolds@parkwayschools.net', role: 'student', points: 120, status: 'active', grade: 10 },
  { id: 'stud-003', first_name: 'Jordan', last_name: 'Kim', email: 'jordan.kim@parkwayschools.net', role: 'volunteer', points: 210, status: 'active', grade: 12 },
  { id: 'stud-004', first_name: 'Sam', last_name: 'Washington', email: 'sam.washington@parkwayschools.net', role: 'student', points: 55, status: 'active', grade: 9 },
  { id: 'stud-005', first_name: 'Chris', last_name: 'Park', email: 'chris.park@parkwayschools.net', role: 'student', points: 30, status: 'active', grade: 11 },
  { id: 'stud-006', first_name: 'Morgan', last_name: 'Davis', email: 'morgan.davis@parkwayschools.net', role: 'student', points: 15, status: 'banned', grade: 10 },
  { id: 'stud-007', first_name: 'Avery', last_name: 'Thompson', email: 'avery.thompson@parkwayschools.net', role: 'volunteer', points: 175, status: 'active', grade: 12 },
  { id: 'stud-008', first_name: 'Riley', last_name: 'Chen', email: 'riley.chen@parkwayschools.net', role: 'student', points: 95, status: 'active', grade: 11 },
  { id: 'stud-009', first_name: 'Casey', last_name: 'Nguyen', email: 'casey.nguyen@parkwayschools.net', role: 'student', points: 40, status: 'active', grade: 9 },
  { id: 'stud-010', first_name: 'Drew', last_name: 'Johnson', email: 'drew.johnson@parkwayschools.net', role: 'admin', points: 300, status: 'active', grade: null },
];

const PLACEHOLDER_VOLUNTEERS = [
  { id: 'vol-001', user_id: 'stud-004', reason: 'I want to help fellow Longhorns find their belongings. I\'m available during lunch and after school in the commons area.', status: 'pending', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: { first_name: 'Sam', last_name: 'Washington', email: 'sam.washington@parkwayschools.net', points: 55 } },
  { id: 'vol-002', user_id: 'stud-005', reason: 'I\'m part of student council and think this would be a great way to build community. I can cover the A-Hall area.', status: 'pending', created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    profiles: { first_name: 'Chris', last_name: 'Park', email: 'chris.park@parkwayschools.net', points: 30 } },
  { id: 'vol-003', user_id: 'stud-009', reason: 'I found three items last month and want to help organize the lost and found more effectively. Can volunteer Tuesday and Thursday mornings.', status: 'pending', created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    profiles: { first_name: 'Casey', last_name: 'Nguyen', email: 'casey.nguyen@parkwayschools.net', points: 40 } },
];

// Hotspot locations within school boundaries
const PLACEHOLDER_HOTSPOTS = [
  { name: 'Commons / Cafeteria', count: 12, coords: [38.6226, -90.5345], intensity: 0.85 },
  { name: 'Library', count: 9, coords: [38.6232, -90.5342], intensity: 0.65 },
  { name: 'Main Gym', count: 7, coords: [38.6224, -90.5355], intensity: 0.50 },
  { name: 'B-Hall', count: 6, coords: [38.6233, -90.5338], intensity: 0.42 },
  { name: 'A-Hall', count: 5, coords: [38.6231, -90.5340], intensity: 0.35 },
  { name: 'Parking Lot A', count: 4, coords: [38.6220, -90.5348], intensity: 0.28 },
  { name: 'Main Office', count: 3, coords: [38.6230, -90.5350], intensity: 0.22 },
];

const Admin = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  const [claims, setClaims] = useState([]);
  const [volApps, setVolApps] = useState([]);
  const [students, setStudents] = useState([]);
  const [mapItems, setMapItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state.user || state.user.role !== 'admin') return;

    const loadAdminData = async () => {
      setLoading(true);
      try {
        const { supabase } = await import('../supabaseClient');

        // Fetch all data in parallel with a 3 second timeout
        const fetchAll = async () => {
          const [
            { data: claimsData },
            { data: volData },
            { data: itemsData },
            { data: profilesData }
          ] = await Promise.all([
            supabase.from('claims').select('*, items(title, type, location_name), profiles(first_name, last_name, email)').order('created_at', { ascending: false }).limit(50),
            supabase.from('volunteer_applications').select('*, profiles(first_name, last_name, email, points, role)').eq('status', 'pending').order('created_at', { ascending: false }),
            supabase.from('items').select('type, status, category, created_at, location_name, coords'),
            supabase.from('profiles').select('*').order('points', { ascending: false })
          ]);
          return { claimsData, volData, itemsData, profilesData };
        };

        const { claimsData, volData, itemsData, profilesData } = await Promise.race([
          fetchAll(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Supabase request timed out')), 3000))
        ]);

        // Use fetched data if available, otherwise fall back to placeholders
        if (claimsData && claimsData.length > 0) {
          setClaims(claimsData);
        } else {
          setClaims(PLACEHOLDER_CLAIMS);
        }

        if (volData && volData.length > 0) {
          setVolApps(volData);
        } else {
          setVolApps(PLACEHOLDER_VOLUNTEERS);
        }

        if (profilesData && profilesData.length > 0) {
          setStudents(profilesData);
        } else {
          setStudents(PLACEHOLDER_STUDENTS);
        }

        if (itemsData && itemsData.length > 0) {
          const lost = itemsData.filter(i => i.type === 'lost').length;
          const found = itemsData.filter(i => i.type === 'found').length;
          const resolved = itemsData.filter(i => i.status === 'resolved').length;
          const active = itemsData.filter(i => i.status === 'active').length;
          
          const cats = {};
          itemsData.forEach(i => { cats[i.category] = (cats[i.category] || 0) + 1; });
          const topCategories = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
          
          const today = new Date().toDateString();
          const todayCount = itemsData.filter(i => new Date(i.created_at).toDateString() === today).length;
          
          setStats({ lost, found, resolved, active, total: itemsData.length, topCategories, todayCount });

          const validMapItems = itemsData.filter(i => Array.isArray(i.coords) && i.coords.length >= 2);
          setMapItems(validMapItems);
        } else {
          setStats(PLACEHOLDER_STATS);
        }

      } catch (err) {
        console.error("Admin load error:", err);
        // On error, use all placeholder data
        setClaims(PLACEHOLDER_CLAIMS);
        setVolApps(PLACEHOLDER_VOLUNTEERS);
        setStudents(PLACEHOLDER_STUDENTS);
        setStats(PLACEHOLDER_STATS);
      } finally {
        setLoading(false);
      }
    };

    loadAdminData();
  }, [state.user]);

  if (!state.user || state.user.role !== 'admin') {
    return (
      <div className="auth-barrier">
        <div className="auth-barrier-card">
          <div className="barrier-icon"><Shield size={36} /></div>
          <h2>Admin Only</h2>
          <p>This page is restricted to RetraceWest admin accounts. Contact administration to request access.</p>
          <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Action Handlers (work on local state)
  const handleClaimAction = async (claimId, action) => {
    try {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('claims').update({ status: action }).eq('id', claimId);
    } catch (err) {
      console.log('Claim action (local fallback):', err);
    }
    setClaims(prev => prev.map(c => c.id === claimId ? { ...c, status: action } : c));
  };

  const handleVolApp = async (appId, action, userId) => {
    try {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('volunteer_applications').update({ status: action }).eq('id', appId);
      if (action === 'approved' && userId) {
        await supabase.from('profiles').update({ role: 'volunteer' }).eq('id', userId);
      }
    } catch (err) {
      console.log('Vol app action (local fallback):', err);
    }
    if (action === 'approved' && userId) {
      setStudents(prev => prev.map(s => s.id === userId ? { ...s, role: 'volunteer' } : s));
    }
    setVolApps(prev => prev.filter(a => a.id !== appId));
  };

  const updateStudentField = async (userId, field, value) => {
    try {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('profiles').update({ [field]: value }).eq('id', userId);
    } catch (err) {
      console.log('Update student (local fallback):', err);
    }
    setStudents(prev => prev.map(s => s.id === userId ? { ...s, [field]: value } : s));
  };

  // Use placeholder hotspots for the heat map
  const hotspotsList = PLACEHOLDER_HOTSPOTS;

  const getHeatColor = (type) => type === 'lost' ? '#ef4444' : '#10b981';
  const getIntensityColor = (intensity) => {
    if (intensity >= 0.8) return '#b91c1c';
    if (intensity >= 0.5) return '#f59e0b';
    return '#3b82f6';
  };
  const getHotspotRadius = (intensity) => {
    return 30 + intensity * 60; // 30-90 meter circles
  };

  return (
    <div className="admin-pw page-wrapper">
      <div className="container" style={{ maxWidth: 1200 }}>

        {/* ── Header ── */}
        <div className="admin-header">
          <div>
            <div className="section-label">Command Center</div>
            <h1 style={{ marginTop: 8 }}>RetraceWest Admin Panel</h1>
            <p style={{ color: 'var(--gray-500)' }}>RetraceWest · Parkway West High School Lost & Found</p>
          </div>
          <div>
            <div className="admin-chip">
              <div className="ac-avatar">{(state.user.firstName || 'A')[0]}</div>
              <div>
                <div className="ac-name">{state.user.firstName}</div>
                <div className="ac-role"><Settings size={10} style={{ marginRight: 3 }}/> System Admin</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="admin-body">
          
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              {loading ? (
                <div className="loading-state"><RefreshCw size={24} className="spin" /> Syncing network...</div>
              ) : stats ? (
                <>
                  <div className="stats-grid">
                    {[
                      { label: 'Total Items', val: stats.total, ico: <Package size={18}/>, color: 'var(--navy)' },
                      { label: 'Active Reports', val: stats.active, ico: <AlertTriangle size={18}/>, color: 'var(--red)' },
                      { label: 'Resolved', val: stats.resolved, ico: <CheckCircle size={18}/>, color: '#16a34a' },
                      { label: "Today's Reports", val: stats.todayCount, ico: <Clock size={18}/>, color: '#4f46e5' },
                      { label: 'Lost Items', val: stats.lost, ico: <Search size={18}/>, color: '#dc2626' },
                      { label: 'Found Items', val: stats.found, ico: <Star size={18}/>, color: '#059669' },
                    ].map((s, i) => (
                      <div key={i} className="content-card stat-card">
                        <div className="sc-icon" style={{ background: `${s.color}15`, color: s.color }}>{s.ico}</div>
                        <div className="sc-val" style={{ color: s.color }}>{s.val}</div>
                        <div className="sc-label">{s.label}</div>
                      </div>
                    ))}
                  </div>

                  <div className="overview-split">
                    <div className="content-card">
                      <h3 style={{ marginBottom: 16 }}><Layers size={16} style={{ display: 'inline', marginRight: 6 }}/> Top Categories</h3>
                      {stats.topCategories.length === 0 ? <p className="empty-text">No active categories.</p> : (
                        <div className="cat-list">
                          {stats.topCategories.map(([cat, count], i) => (
                            <div key={i} className="cat-row">
                              <span className="cat-name">{cat}</span>
                              <div className="bar-bg"><div className="bar-fill" style={{ width: `${(count / stats.total) * 100}%` }}/></div>
                              <span className="cat-count">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="content-card">
                      <h3 style={{ marginBottom: 16 }}><TrendingUp size={16} style={{ display: 'inline', marginRight: 6 }}/> Performance</h3>
                      <div className="perf-list">
                        {[
                          { label: 'Recovery Rate', val: stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0, color: '#16a34a' },
                          { label: 'Active vs Total', val: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0, color: 'var(--red)' },
                          { label: 'Found → Returned', val: stats.found > 0 ? Math.round((stats.resolved / stats.found) * 100) : 0, color: 'var(--navy)' },
                        ].map((p, i) => (
                          <div key={i} className="perf-row">
                            <div className="perf-top"><span>{p.label}</span><strong style={{ color: p.color }}>{p.val}%</strong></div>
                            <div className="bar-bg"><div className="bar-fill-navy" style={{ width: `${p.val}%`, background: p.color }}/></div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="summary-alert">
                        <FileText size={16}/>
                        <span>{claims.filter(c => c.status === 'pending').length} pending claims need review</span>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setActiveTab('moderation')}>Review→</button>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* HEAT ZONE (Leaflet) */}
          {activeTab === 'heatmap' && (
            <div className="tab-pane" style={{ paddingBottom: '120px' }}>
              <div className="hp-header" style={{ marginBottom: 20 }}>
                <h2>Campus Heat Zone Map</h2>
                <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>Real-time 2D spatial distribution of missing and found items at Parkway West High School.</p>
              </div>

              <div className="heat-split">
                <div className="map-view-box" style={{ borderRadius: 16, overflow: 'hidden', border: '2px solid var(--gray-200)', minHeight: 400 }}>
                  <MapContainer 
                    center={SCHOOL_CENTER} 
                    zoom={17} 
                    style={{ height: '100%', width: '100%', minHeight: 400 }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                    />
                    {/* School Boundary */}
                    <Circle 
                      center={SCHOOL_CENTER}
                      radius={SCHOOL_RADIUS_METERS}
                      pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.05, weight: 2 }}
                    />
                    
                    {/* Hotspot Heat Circles */}
                    {hotspotsList.map((hotspot, i) => (
                      <Circle
                        key={`hotspot-${i}`}
                        center={hotspot.coords}
                        radius={getHotspotRadius(hotspot.intensity)}
                        pathOptions={{
                          color: getIntensityColor(hotspot.intensity),
                          fillColor: getIntensityColor(hotspot.intensity),
                          fillOpacity: 0.25 + hotspot.intensity * 0.2,
                          weight: 2,
                        }}
                      >
                        <Popup>
                          <strong>{hotspot.name}</strong><br/>
                          {hotspot.count} items reported<br/>
                          Intensity: {Math.round(hotspot.intensity * 100)}%
                        </Popup>
                      </Circle>
                    ))}

                    {/* Individual hotspot center dots */}
                    {hotspotsList.map((hotspot, i) => (
                      <CircleMarker
                        key={`dot-${i}`}
                        center={hotspot.coords}
                        radius={5}
                        pathOptions={{
                          color: 'white',
                          weight: 2,
                          fillColor: getIntensityColor(hotspot.intensity),
                          fillOpacity: 0.9
                        }}
                      >
                        <Popup>
                          <strong>{hotspot.name}</strong><br/>
                          {hotspot.count} items reported
                        </Popup>
                      </CircleMarker>
                    ))}

                    {/* Actual DB items if available */}
                    {mapItems.map((item, i) => {
                      if (!item.coords || item.coords.length < 2) return null;
                      const lat = item.coords[0];
                      const lng = item.coords[1];
                      return (
                        <CircleMarker
                          key={`item-${i}`}
                          center={[lat, lng]}
                          radius={4}
                          pathOptions={{
                            color: 'white',
                            weight: 1.5,
                            fillColor: getHeatColor(item.type),
                            fillOpacity: 0.8
                          }}
                        >
                          <Popup>
                            <strong>{item.location_name}</strong><br/>
                            Status: {item.status}<br/>
                            Type: {item.type}
                          </Popup>
                        </CircleMarker>
                      );
                    })}
                  </MapContainer>
                </div>

                <div className="content-card">
                  <h3 style={{ marginBottom: 16 }}>Hotspot Analysis</h3>
                  <div className="hs-list">
                    {hotspotsList.map((area, i) => (
                      <div key={i} className="hs-tr">
                        <span className="hs-rank">#{i+1}</span>
                        <span className="hs-name">{area.name}</span>
                        <div className="bar-bg" style={{ flex: 1, margin: '0 12px' }}>
                          <div className="bar-fill" style={{ background: getIntensityColor(area.intensity), width: `${area.intensity * 100}%` }}/>
                        </div>
                        <span className="hs-val">{area.count}</span>
                      </div>
                    ))}
                  </div>
                  {hotspotsList[0] && (
                    <div className="hs-alert">
                      <AlertTriangle size={16} />
                      <div>
                        <strong>Recommendation:</strong> Add a satellite drop box in the {hotspotsList[0].name}. It accounts for the highest volume of lost items ({hotspotsList[0].count} reports).
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 16, padding: 12, background: 'var(--gray-50)', borderRadius: 'var(--r-md)', fontSize: '0.8rem', color: 'var(--gray-500)' }}>
                    <strong style={{ color: 'var(--navy)' }}>Legend:</strong>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#b91c1c', display: 'inline-block' }}/> High</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}/> Medium</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}/> Low</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODERATION */}
          {activeTab === 'moderation' && (
            <div className="tab-pane">
              <h2 style={{ marginBottom: 8 }}>Item Claims</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: '0.9rem' }}>Review claims to prevent wrongful item pickups.</p>

              {claims.length === 0 ? (
                <div className="empty-state">No pending claims.</div>
              ) : (
                <div className="mod-list">
                  {claims.map((claim, i) => (
                    <div key={claim.id || i} className={`content-card mod-card ${claim.status}`}>
                      <div className="mc-head">
                        <div className="mc-title">
                          <span className={`mc-tag ${claim.items?.type || 'lost'}`}>{claim.items?.type || 'lost'}</span>
                          <strong>{claim.items?.title || 'Unknown Item'}</strong>
                          <span className="mc-loc">{claim.items?.location_name}</span>
                        </div>
                        <span className={`mc-status ${claim.status}`}>{claim.status}</span>
                      </div>
                      <div className="mc-body">
                        <div><strong>Claimant:</strong> {claim.profiles?.first_name} {claim.profiles?.last_name}</div>
                        <div style={{ color: 'var(--gray-500)' }}>{claim.profiles?.email}</div>
                        {claim.description && <div className="mc-desc"><Eye size={12}/> {claim.description}</div>}
                      </div>

                      {claim.status === 'pending' && (
                        <div className="mc-actions">
                          <button className="btn-ghost" onClick={() => handleClaimAction(claim.id, 'rejected')}><X size={14}/> Reject</button>
                          <button className="btn-primary" style={{ background: '#16a34a', borderColor: '#16a34a' }} onClick={() => handleClaimAction(claim.id, 'approved')}><CheckCircle size={14}/> Approve</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STUDENTS (Management) */}
          {activeTab === 'students' && (
            <div className="tab-pane">
              <h2 style={{ marginBottom: 8 }}>Campus Students</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: '0.9rem' }}>Govern student access, ban unruly users, and manually adjust ranks.</p>

              {students.length === 0 ? (
                <div className="empty-state">No students found.</div>
              ) : (
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Role</th>
                        <th>Points</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} className={s.status === 'banned' ? 'banned-row' : ''}>
                          <td>
                            <strong>{s.first_name} {s.last_name}</strong>
                            <div className="sub-text">{s.email}</div>
                          </td>
                          <td>
                            <select 
                              value={s.role} 
                              onChange={(e) => updateStudentField(s.id, 'role', e.target.value)}
                              className="inline-select"
                              disabled={s.status === 'banned'}
                            >
                              <option value="student">Student</option>
                              <option value="volunteer">Volunteer</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input 
                                type="number" 
                                value={s.points || 0} 
                                onChange={(e) => updateStudentField(s.id, 'points', parseInt(e.target.value) || 0)}
                                className="inline-input-sm"
                                disabled={s.status === 'banned'}
                              />
                            </div>
                          </td>
                          <td>
                            {s.status === 'banned' ? (
                              <span className="mc-status rejected">BANNED</span>
                            ) : (
                              <span className="mc-status approved">ACTIVE</span>
                            )}
                          </td>
                          <td>
                            {s.status === 'banned' ? (
                              <button className="btn-ghost btn-sm" onClick={() => updateStudentField(s.id, 'status', 'active')}><UserCheck size={14}/> Unban</button>
                            ) : (
                              <button className="btn-ghost btn-sm danger" onClick={() => updateStudentField(s.id, 'status', 'banned')}><Ban size={14}/> Ban</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* VOLUNTEERS */}
          {activeTab === 'volunteers' && (
            <div className="tab-pane">
              <h2 style={{ marginBottom: 8 }}>Volunteer Applications</h2>
              <p style={{ color: 'var(--gray-500)', marginBottom: 24, fontSize: '0.9rem' }}>Review applications for student coordinators.</p>

              {volApps.length === 0 ? (
                <div className="empty-state">No pending applications.</div>
              ) : (
                <div className="mod-list">
                  {volApps.map((app, i) => (
                    <div key={app.id || i} className="content-card vol-card">
                      <div className="vc-head">
                        <div className="vc-avatar">{(app.profiles?.first_name || app.name || 'V')[0]}</div>
                        <div>
                          <strong>{app.profiles?.first_name || app.name} {app.profiles?.last_name || ''}</strong>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)' }}>{app.profiles?.email} · {app.profiles?.points ?? 0} pts</div>
                        </div>
                      </div>
                      <div className="vc-reason">"{app.reason}"</div>
                      <div className="mc-actions">
                        <button className="btn-ghost" onClick={() => handleVolApp(app.id, 'rejected', app.user_id)}><X size={14}/> Decline</button>
                        <button className="btn-primary" onClick={() => handleVolApp(app.id, 'approved', app.user_id)}><CheckCircle size={14}/> Approve</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ── Base Structure ── */
        .admin-header { display: flex; justify-content: space-between; align-items: flex-start; margin: 48px 0 32px; }
        .admin-chip { display: flex; align-items: center; gap: 12px; background: var(--white); border: 1px solid var(--gray-200); padding: 10px 14px; border-radius: var(--r-md); }
        .ac-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--navy); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .ac-name { font-weight: 700; font-size: 0.9rem; color: var(--navy); }
        .ac-role { font-size: 0.75rem; color: var(--red); display: flex; align-items: center; font-weight: 600; text-transform: uppercase; }

        .admin-tabs { display: flex; gap: 4px; border-bottom: 2px solid var(--gray-200); margin-bottom: 32px; overflow-x: auto; }
        .admin-tab { background: transparent; border: none; padding: 12px 20px; font-weight: 600; font-size: 0.95rem; color: var(--gray-500); display: flex; align-items: center; gap: 8px; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.2s; white-space: nowrap; cursor: pointer; }
        .admin-tab:hover { color: var(--navy); }
        .admin-tab.active { color: var(--red); border-bottom-color: var(--red); }

        .loading-state, .empty-text, .empty-state { text-align: center; color: var(--gray-500); font-size: 0.95rem; }
        .loading-state, .empty-state { padding: 60px 0; }
        .empty-state { background: var(--white); border: 1px dashed var(--gray-300); border-radius: var(--r-md); }
        .spin { animation: spin 1s linear infinite; display: inline-block; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ── Overview Stats ── */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { text-align: center; padding: 20px 12px; }
        .sc-icon { width: 44px; height: 44px; border-radius: var(--r-md); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
        .sc-val { font-size: 1.8rem; font-weight: 900; line-height: 1; margin-bottom: 4px; }
        .sc-label { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--gray-500); }

        .overview-split { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .cat-list { display: flex; flex-direction: column; gap: 12px; }
        .cat-row { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; }
        .cat-name { width: 120px; font-weight: 600; color: var(--navy); }
        .cat-count { width: 30px; text-align: right; font-weight: 700; }
        
        .perf-list { display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px; }
        .perf-row { font-size: 0.9rem; }
        .perf-top { display: flex; justify-content: space-between; margin-bottom: 6px; font-weight: 600; }
        .summary-alert { display: flex; align-items: center; justify-content: space-between; background: var(--gray-50); padding: 12px 16px; border-radius: var(--r-md); font-size: 0.9rem; border: 1px solid var(--gray-200); font-weight: 500; }

        /* ── Heatmap ── */
        .heat-split { display: grid; grid-template-columns: 1fr 380px; gap: 24px; }
        
        .hs-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .hs-tr { display: flex; align-items: center; font-size: 0.85rem; }
        .hs-rank { font-weight: 800; width: 28px; }
        .hs-name { font-weight: 600; color: var(--navy); width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hs-val { font-weight: 700; width: 24px; text-align: right; }
        .hs-alert { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; padding: 14px; border-radius: var(--r-md); font-size: 0.85rem; display: flex; gap: 10px; line-height: 1.5; font-weight: 500;}

        /* ── Mod List & Cards ── */
        .mod-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; }
        .mod-card { padding: 20px; }
        .mc-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .mc-title { display: flex; flex-direction: column; gap: 6px; }
        .mc-tag { align-self: flex-start; padding: 3px 10px; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; border-radius: 4px; letter-spacing: 0.05em; }
        .mc-tag.lost { background: var(--red-light); color: var(--red); }
        .mc-tag.found { background: #dcfce7; color: #166534; }
        .mc-title strong { font-size: 1.1rem; color: var(--navy); }
        .mc-loc { font-size: 0.85rem; color: var(--gray-500); }
        
        .mc-status { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; padding: 4px 12px; border-radius: 50px; letter-spacing: 0.05em; }
        .mc-status.pending { background: #fef3c7; color: #b45309; }
        .mc-status.approved { background: #dcfce7; color: #166534; }
        .mc-status.rejected { background: var(--red-light); color: var(--red); }
        
        .mc-body { font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px; }
        .mc-desc { margin-top: 10px; padding: 12px; background: var(--gray-50); border-radius: var(--r-sm); font-style: italic; color: var(--gray-600); display: flex; gap: 8px; font-size: 0.85rem; }
        .mc-actions { display: flex; gap: 10px; justify-content: flex-end; border-top: 1px solid var(--gray-100); padding-top: 16px; }

        .vol-card { padding: 20px; }
        .vc-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .vc-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--gray-100); color: var(--navy); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; font-weight: 700; }
        .vc-reason { font-size: 0.9rem; color: var(--gray-600); font-style: italic; background: var(--gray-50); padding: 16px; border-radius: var(--r-md); margin-bottom: 16px; line-height: 1.6; }

        /* ── Students Table ── */
        .table-responsive { width: 100%; overflow-x: auto; background: white; border-radius: var(--r-lg); border: 1px solid var(--gray-200); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: var(--gray-50); padding: 16px 20px; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--gray-500); border-bottom: 1px solid var(--gray-200); }
        .admin-table td { padding: 16px 20px; border-bottom: 1px solid var(--gray-100); vertical-align: middle; }
        .admin-table tr:last-child td { border-bottom: none; }
        .banned-row td { background: #fef2f2; opacity: 0.8; }
        .sub-text { font-size: 0.85rem; color: var(--gray-500); margin-top: 2px; }
        
        .inline-select { padding: 6px 10px; border-radius: 6px; border: 1px solid var(--gray-200); background: white; font-size: 0.85rem; font-weight: 600; color: var(--navy); outline: none; cursor: pointer; }
        .inline-input-sm { width: 60px; padding: 6px; border-radius: 6px; border: 1px solid var(--gray-200); text-align: center; font-size: 0.85rem; font-weight: 700; outline: none; }
        .btn-sm { padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
        .btn-sm.danger { color: var(--red); background: var(--red-light); }
        .btn-sm.danger:hover { background: #fca5a5; }

        @media (max-width: 1024px) {
          .overview-split, .heat-split, .mod-list { grid-template-columns: 1fr; }
          .admin-header { flex-direction: column; gap: 16px; }
        }
      `}</style>
    </div>
  );
};

export default Admin;
