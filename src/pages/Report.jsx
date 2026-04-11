import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle, MapPin, Navigation,
    Camera, Info, CheckCircle2, CheckCircle,
    Trophy, ChevronRight, ArrowRight, X
} from 'lucide-react';
import { useApp, PARKWAY_WEST } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';

const CAMPUS_LOCATIONS = [
    { name: 'Main Office',          coords: [38.6230, -90.5350] },
    { name: 'Commons / Cafeteria',  coords: [38.6226, -90.5345] },
    { name: 'Library',              coords: [38.6232, -90.5342] },
    { name: 'Gym (Main)',           coords: [38.6224, -90.5355] },
    { name: 'Gym (Auxiliary)',      coords: [38.6222, -90.5358] },
    { name: 'A-Hall',               coords: [38.6231, -90.5340] },
    { name: 'B-Hall',               coords: [38.6233, -90.5338] },
    { name: 'C-Hall',               coords: [38.6235, -90.5336] },
    { name: 'D-Hall',               coords: [38.6237, -90.5334] },
    { name: 'E-Hall',               coords: [38.6239, -90.5332] },
    { name: 'Fine Arts Wing',       coords: [38.6234, -90.5330] },
    { name: 'Science Wing',         coords: [38.6236, -90.5328] },
    { name: 'Parking Lot A',        coords: [38.6220, -90.5348] },
    { name: 'Parking Lot B',        coords: [38.6218, -90.5344] },
    { name: 'Auditorium',           coords: [38.6228, -90.5356] },
    { name: 'Band Room',            coords: [38.6226, -90.5358] },
    { name: 'Counseling Office',    coords: [38.6230, -90.5344] },
    { name: 'Student Entrance',     coords: [38.6222, -90.5350] },
    { name: 'Weight Room',          coords: [38.6220, -90.5357] },
    { name: 'Pool / Natatorium',    coords: [38.6219, -90.5360] },
];

const Report = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Electronics');
    const [type, setType] = useState('lost');
    const [locationName, setLocationName] = useState('');
    const [customLocation, setCustomLocation] = useState('');
    const [desc, setDesc] = useState('');
    const [locMode, setLocMode] = useState('grid');
    const [coords, setCoords] = useState(null);
    const [image, setImage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const fileInputRef = useRef(null);

    if (!state.user) {
        return (
            <div className="rp-auth-barrier">
                <motion.div className="rp-auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="rp-auth-icon"><PlusCircle size={40} /></div>
                    <h2>Sign In Required</h2>
                    <p>You need a @parkwayschools.net account to report lost or found items on campus.</p>
                    <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => navigate('/auth')}>
                        Sign In — Longhorns <ChevronRight size={18} />
                    </button>
                </motion.div>
                <style>{`
                    .rp-auth-barrier { min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--off-white); padding:24px; padding-top:var(--nav-h); }
                    .rp-auth-card { background:white; border:1px solid var(--gray-200); border-radius:24px; padding:48px 40px; max-width:420px; width:100%; text-align:center; box-shadow:0 20px 40px rgba(0,0,0,0.08); }
                    .rp-auth-icon { width:72px;height:72px;border-radius:50%;background:var(--red-light);color:var(--red);display:flex;align-items:center;justify-content:center;margin:0 auto 20px; }
                    .rp-auth-card h2 { font-size:1.6rem;font-weight:800;color:var(--navy);margin-bottom:10px; }
                    .rp-auth-card p { color:var(--gray-500);line-height:1.6; }
                `}</style>
            </div>
        );
    }

    const pickLocation = (loc) => {
        setCoords(loc.coords);
        setLocationName(loc.name);
        setCustomLocation('');
    };

    const handleCustomLocation = (val) => {
        setCustomLocation(val);
        setLocationName(val);
        setCoords([38.6228, -90.5347]);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 500 * 1024) {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                const maxDim = 800;
                let w = img.width, h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) { h = (h / w) * maxDim; w = maxDim; }
                    else { w = (w / h) * maxDim; h = maxDim; }
                }
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0, w, h);
                setImage(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.src = URL.createObjectURL(file);
        } else {
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!state.user || state.user.status === 'banned') {
            alert('Your account is restricted from submitting reports. Contact administration.');
            return;
        }
        if (!title.trim()) { alert('Please enter a title for the item.'); return; }
        if (!locationName.trim()) { alert('Please select or enter a campus location.'); return; }

        const finalCoords = coords || [38.6228, -90.5347];

        setSubmitting(true);
        setSubmitError(null);

        const localItem = {
            id: `it-${Date.now()}`,
            schoolId: 'parkway-west',
            school_id: 'parkway-west',
            type,
            title: title.trim(),
            category,
            location: locationName.trim(),
            location_name: locationName.trim(),
            coords: finalCoords,
            description: desc.trim(),
            reporter: state.user.firstName || 'Student',
            reporter_id: state.user.id || null,
            status: 'active',
            created_at: new Date().toISOString(),
            timestamp: Date.now(),
            image,
        };

        // Immediately add to local state — this is instant
        dispatch({ type: 'ADD_ITEM', payload: localItem });

        // Award points immediately
        const pointsEarned = type === 'found' ? 10 : 5;
        const newPoints = (state.user.points || 0) + pointsEarned;
        dispatch({ type: 'UPDATE_USER_POINTS', payload: newPoints });

        // Show success immediately — don't wait for Supabase
        setSubmitting(false);
        setSubmitted(true);

        // Try to persist to Supabase in the background (fire-and-forget)
        try {
            const { supabase } = await import('../supabaseClient');
            const dbItem = { ...localItem };
            delete dbItem.image; // Don't send base64 to DB
            delete dbItem.timestamp;
            delete dbItem.schoolId;

            // Use a promise race with a 4 second timeout
            await Promise.race([
                supabase.from('items').insert([dbItem]),
                new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000))
            ]);
        } catch (err) {
            // Silently fail — item is already in local state
            console.log('Background DB insert skipped:', err.message || err);
        }
    };

    if (submitted) {
        return (
            <div className="rp-success-screen">
                <motion.div className="rp-success-card" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, type: 'spring' }}>
                    <div className="rp-success-icon"><CheckCircle size={48} /></div>
                    <h2>Report Submitted!</h2>
                    <p>Your {type} item report has been added to the campus registry. {type === 'found' && 'You earned +10 pts!'}</p>
                    <div className="rp-success-btns">
                        <button className="btn-primary" onClick={() => navigate('/registry')}>Browse Registry <ArrowRight size={16}/></button>
                        <button className="btn-ghost" onClick={() => { setSubmitted(false); setTitle(''); setDesc(''); setCoords(null); setLocationName(''); setImage(null); setCustomLocation(''); }}>Report Another</button>
                    </div>
                </motion.div>
                <style>{`
                    .rp-success-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--off-white);padding:24px;padding-top:var(--nav-h);}
                    .rp-success-card{background:white;border:1px solid var(--gray-200);border-radius:24px;padding:56px 48px;max-width:480px;width:100%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.08);}
                    .rp-success-icon{width:88px;height:88px;border-radius:50%;background:#dcfce7;color:#16a34a;display:flex;align-items:center;justify-content:center;margin:0 auto 24px;}
                    .rp-success-card h2{font-size:2rem;font-weight:900;color:var(--navy);margin-bottom:12px;letter-spacing:-0.02em;}
                    .rp-success-card p{color:var(--gray-500);line-height:1.7;margin-bottom:32px;}
                    .rp-success-btns{display:flex;flex-direction:column;gap:12px;}
                `}</style>
            </div>
        );
    }

    return (
        <div className="report-pw" style={{ minHeight: '100vh', background: 'var(--off-white)', paddingTop: 'var(--nav-h)' }}>
            <motion.section className="rp-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="container" style={{ maxWidth: 920 }}>
                    <div className="rp-badge">Create Report</div>
                    <h1>Report an Item</h1>
                    <p>Report something you lost, or something you found to help a fellow Longhorn.</p>
                </div>
            </motion.section>

            <section style={{ padding: '48px 0 80px' }}>
                <div className="container" style={{ maxWidth: 1300 }}>
                    <motion.div className="rp-type-toggle" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <button className={`rp-toggle-btn ${type === 'lost' ? 'active-lost' : ''}`} onClick={() => setType('lost')}>Lost Item Report</button>
                        <button className={`rp-toggle-btn ${type === 'found' ? 'active-found' : ''}`} onClick={() => setType('found')}>Found Item Report</button>
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div key={type} className={`rp-points-banner ${type}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                            {type === 'found'
                                ? <><Trophy size={16}/> <strong>Good Samaritan:</strong> You'll earn +10 pts for reporting a found item.</>
                                : <><Info size={16}/> <strong>Community Alert:</strong> We'll notify you if a match is found. (+5 pts for reporting)</>
                            }
                        </motion.div>
                    </AnimatePresence>

                    {submitError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: '0.9rem' }}>
                            {submitError}
                        </div>
                    )}

                    <div className="rp-form-grid">
                        <motion.div className="rp-card" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                            <div className="rp-card-header"><span className="rp-step">1</span><h3>Item Details</h3></div>
                            <div className="rp-field">
                                <label>What is it? <span className="req">*</span></label>
                                <input type="text" placeholder="e.g. Navy Blue TI-84 Calculator" value={title} onChange={e => setTitle(e.target.value)} maxLength={50} />
                            </div>
                            <div className="rp-field">
                                <label>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}>
                                    <option>Electronics</option><option>Clothing</option><option>Accessories</option><option>School Supplies</option><option>Keys / IDs</option><option>Jewelry</option><option>Other</option>
                                </select>
                            </div>
                            <div className="rp-field">
                                <label>Description <span className="rp-char-ct">{desc.length}/200</span></label>
                                <textarea rows={4} placeholder="Any unique features, markings, or serial numbers..." value={desc} onChange={e => setDesc(e.target.value)} maxLength={200} />
                            </div>
                            <div className="rp-field">
                                <label>Photo <span style={{ fontWeight: 400, color: 'var(--gray-400)' }}>(Optional)</span></label>
                                <div className="rp-photo-box" onClick={() => fileInputRef.current?.click()}>
                                    {image ? (
                                        <div className="rp-photo-preview"><img src={image} alt="Preview" /><div className="rp-photo-overlay">Click to change</div></div>
                                    ) : (
                                        <div className="rp-photo-empty"><Camera size={28} /><span>Click to upload a photo</span></div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
                            </div>
                        </motion.div>

                        <motion.div className="rp-card" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <div className="rp-card-header"><span className="rp-step">2</span><h3>Campus Location <span className="req">*</span></h3></div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', marginBottom: 16 }}>Select where you {type === 'lost' ? 'last saw' : 'found'} the item:</p>
                            <div className="loc-mode-toggle" style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <button className={`loc-mode-btn ${locMode === 'grid' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setLocMode('grid'); }}>Quick Select</button>
                                <button className={`loc-mode-btn ${locMode === 'map' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setLocMode('map'); }}>Map Pin</button>
                            </div>

                            {locMode === 'grid' ? (
                                <div className="rp-location-grid">
                                    {CAMPUS_LOCATIONS.map((loc) => (
                                        <button key={loc.name} className={`rp-loc-btn ${locationName === loc.name ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); pickLocation(loc); }}>
                                            <MapPin size={12} />{loc.name}{locationName === loc.name && <CheckCircle2 size={12} style={{ marginLeft: 'auto', color: '#16a34a' }} />}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="rp-map-picker" style={{ height: 350, width: '100%', borderRadius: 14, overflow: 'hidden', border: '1.5px solid var(--gray-200)', marginBottom: 8 }}>
                                    <MapView enable3D={false} onMapClick={(c) => { setCoords(c); setLocationName('Pinned on Map'); setCustomLocation(''); }}
                                        items={coords ? [{ id: 'pin', type: type, coords: coords }] : []}
                                        schoolBoundary={{ center: [-90.5347, 38.6228], radius: 0.25 * 1609.34 }} />
                                </div>
                            )}

                            <div className="rp-field" style={{ marginTop: 20 }}>
                                <label>Or type a custom location</label>
                                <input type="text" placeholder="e.g. Room 214, 2nd Floor Science" value={customLocation} onChange={e => handleCustomLocation(e.target.value)} maxLength={60} />
                            </div>

                            {coords && (
                                <motion.div className="rp-location-confirmed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                    <CheckCircle2 size={16} />
                                    <div><strong>Location set:</strong> {locationName}<div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: 2 }}>{coords[0].toFixed(4)}°N, {Math.abs(coords[1]).toFixed(4)}°W</div></div>
                                    <button onClick={() => { setCoords(null); setLocationName(''); setCustomLocation(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', marginLeft: 'auto' }}><X size={16}/></button>
                                </motion.div>
                            )}
                        </motion.div>
                    </div>

                    <motion.div className="rp-submit-bar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div><p style={{ color: 'var(--gray-500)', fontSize: '0.85rem' }}>This report will be visible to all verified Parkway West students.</p></div>
                        <button className="btn-primary rp-submit-btn" onClick={handleSubmit} disabled={submitting || !title || !locationName || state.user?.status === 'banned'}>
                            {submitting ? 'Submitting...' : state.user?.status === 'banned' ? 'Account Restricted' : `Submit ${type === 'lost' ? 'Lost' : 'Found'} Report`}
                            {!submitting && <ArrowRight size={18} />}
                        </button>
                    </motion.div>
                </div>
            </section>

            <style>{`
                .rp-header { background: var(--navy); padding: 56px 0 44px; border-bottom: 4px solid var(--red); }
                .rp-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.7); padding: 6px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 16px; }
                .rp-header h1 { color: white; font-size: 2.4rem; font-weight: 900; margin-bottom: 10px; letter-spacing: -0.02em; }
                .rp-header p { color: rgba(255,255,255,0.65); font-size: 1rem; }
                .rp-type-toggle { display: flex; background: white; border: 2px solid var(--gray-200); border-radius: 16px; padding: 6px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
                .rp-toggle-btn { flex: 1; padding: 16px 24px; border: none; background: transparent; border-radius: 12px; font-size: 1.05rem; font-weight: 700; color: var(--gray-500); cursor: pointer; transition: all 0.25s; letter-spacing: -0.01em; }
                .rp-toggle-btn.active-lost  { background: #FEE2E2; color: #991b1b; }
                .rp-toggle-btn.active-found { background: #DCFCE7; color: #166534; }
                .rp-points-banner { display: flex; align-items: center; gap: 10px; padding: 14px 18px; border-radius: 12px; font-size: 0.9rem; margin-bottom: 28px; overflow: hidden; }
                .rp-points-banner.found { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
                .rp-points-banner.lost { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
                .rp-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
                .rp-card { background: white; border: 1px solid var(--gray-200); border-radius: 20px; padding: 36px; box-shadow: 0 4px 12px -4px rgba(0,0,0,0.06); }
                .rp-card-header { display: flex; align-items: center; gap: 14px; margin-bottom: 28px; }
                .rp-step { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, var(--blue) 0%, #1d4ed8 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; font-weight: 900; flex-shrink: 0; box-shadow: 0 4px 10px rgba(59,130,246,0.35); }
                .rp-card-header h3 { font-size: 1.4rem; font-weight: 800; color: var(--navy); }
                .rp-field { margin-bottom: 22px; }
                .rp-field label { display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; font-weight: 700; color: var(--gray-700); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
                .req { color: var(--red); }
                .rp-char-ct { font-weight: 400; text-transform: none; color: var(--gray-400); font-size: 0.75rem; }
                .rp-field input, .rp-field select, .rp-field textarea { width: 100%; background: var(--gray-50); border: 1.5px solid var(--gray-200); border-radius: 12px; padding: 14px 18px; font-size: 1rem; color: var(--navy); font-family: inherit; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
                .rp-field input:focus, .rp-field select:focus, .rp-field textarea:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.12); background: white; }
                .rp-field textarea { resize: vertical; }
                .rp-photo-box { border: 2px dashed var(--gray-300); border-radius: 14px; height: 140px; cursor: pointer; overflow: hidden; transition: border-color 0.2s, background 0.2s; }
                .rp-photo-box:hover { border-color: var(--navy); background: var(--gray-50); }
                .rp-photo-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--gray-400); gap: 8px; font-size: 0.85rem; font-weight: 600; }
                .rp-photo-preview { width: 100%; height: 100%; position: relative; }
                .rp-photo-preview img { width: 100%; height: 100%; object-fit: cover; }
                .rp-photo-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.45); color: white; display: flex; align-items: center; justify-content: center; opacity: 0; font-weight: 600; font-size: 0.85rem; transition: opacity 0.2s; }
                .loc-mode-btn { flex: 1; padding: 10px; border-radius: 8px; border: 1.5px solid var(--gray-200); background: var(--white); font-weight: 600; font-size: 0.9rem; color: var(--gray-500); cursor: pointer; transition: all 0.2s; }
                .loc-mode-btn:hover { background: var(--gray-50); }
                .loc-mode-btn.active { border-color: var(--blue); background: #eff6ff; color: var(--blue); }
                .rp-photo-box:hover .rp-photo-overlay { opacity: 1; }
                .rp-location-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 4px; }
                .rp-location-grid::-webkit-scrollbar { width: 4px; }
                .rp-location-grid::-webkit-scrollbar-track { background: transparent; }
                .rp-location-grid::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 4px; }
                .rp-loc-btn { display: flex; align-items: center; gap: 6px; padding: 9px 12px; border: 1.5px solid var(--gray-200); border-radius: 10px; background: var(--gray-50); font-size: 0.8rem; font-weight: 600; color: var(--gray-700); cursor: pointer; text-align: left; transition: all 0.2s; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .rp-loc-btn:hover { border-color: var(--blue); color: var(--blue); background: #eff6ff; }
                .rp-loc-btn.active { border-color: #16a34a; background: #f0fdf4; color: #166534; }
                .rp-location-confirmed { display: flex; align-items: flex-start; gap: 12px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin-top: 16px; color: #166534; font-size: 0.88rem; }
                .rp-submit-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 32px; padding: 24px 32px; background: white; border: 1px solid var(--gray-200); border-radius: 20px; box-shadow: 0 4px 12px -4px rgba(0,0,0,0.06); }
                .rp-submit-btn { padding: 14px 32px; font-size: 1rem; opacity: 1; transition: opacity 0.2s, transform 0.2s; }
                .rp-submit-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
                @media (max-width: 768px) { .rp-form-grid { grid-template-columns: 1fr; } .rp-submit-bar { flex-direction: column; gap: 16px; align-items: stretch; text-align: center; } .rp-location-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    );
};

export default Report;
