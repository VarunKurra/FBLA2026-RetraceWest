import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    PlusCircle, MapPin, Search, Navigation,
    Camera, Info, AlertCircle, CheckCircle2,
    Crosshair, MousePointer2
} from 'lucide-react';
import MapView from '../components/MapView';
import { useApp, MISSOURI_SCHOOLS } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

// the place where people report their lost airpods lol
const Report = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('Electronics');
    const [type, setType] = useState('lost');
    const [locationName, setLocationName] = useState('');
    const [desc, setDesc] = useState('');
    const [coords, setCoords] = useState(null);
    const [pickingMode, setPickingMode] = useState('none'); // 'current' or 'manual'
    const [image, setImage] = useState(null);
    const fileInputRef = useRef(null);

    if (!state.user) {
        return (
            <div className="auth-barrier">
                <motion.div
                    className="auth-barrier-card glass"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="barrier-icon">
                        <PlusCircle size={42} />
                    </div>
                    <h2>Contributor Access</h2>
                    <p>Contribute to your campus network. Please sign in to securely report lost or found items.</p>
                    <button className="btn-primary" onClick={() => navigate('/auth')}>
                        Secure Sign In <ChevronRight size={20} />
                    </button>
                </motion.div>
            </div>
        );
    }

    const userSchool = MISSOURI_SCHOOLS.find(s => s.id === state.user.schoolId);

    const handleUseCurrentLocation = () => {
        setCoords(state.myLocation);
        setPickingMode('current');
    };

    const handleMapClick = (newCoords) => {
        setCoords(newCoords);
        setPickingMode('manual');
    };

    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        if (!title || !locationName || !coords) {
            alert('Please fill out all required fields and mark a location.');
            return;
        }

        setSubmitting(true);
        const newItem = {
            id: `it-${Date.now()}`, // Temporary fallback ID if supabase doesn't auto-gen or we don't have select privileges
            schoolId: state.user.schoolId,
            type,
            title,
            category,
            location: locationName,
            coords, // Supabase jsonb handles array
            reporter: state.user.name,
            status: 'listed',
            timestamp: Date.now(),
            desc,
            image // Add image to item object
        };

        const { data, error } = await supabase.from('items').insert([newItem]).select();
        setSubmitting(false);

        if (error) {
            console.error("Supabase insert error, falling back to local state:", error.message);
            dispatch({ type: 'ADD_ITEM', payload: newItem });
        } else if (data && data.length > 0) {
            dispatch({ type: 'ADD_ITEM', payload: data[0] });
        } else {
            dispatch({ type: 'ADD_ITEM', payload: newItem });
        }

        navigate('/registry');
    };

    return (
        <div className="report-v5 page-wrapper">
            <div className="container">
                <header className="report-header-v5">
                    <div className="header-txt">
                        <div className="badge">{userSchool?.name || 'Local Campus'} Reporter</div>
                        <h1>List an Item</h1>
                        <p>Provide details and mark a precise location to help the community recover this item.</p>
                    </div>
                </header>

                <div className="report-grid-v5">
                    {/* LEFT FORM */}
                    <div className="report-form glass animate-fade">
                        <div className="form-info-card">
                            <Info size={18} />
                            <p>Verify all details before submitting. Precise locations help students recover items faster.</p>
                        </div>

                        <div className="form-sec">
                            <label>Item Designation</label>
                            <input
                                type="text"
                                className="premium-input"
                                placeholder="e.g. Silver MacBook Air, Blue Gatorade..."
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-sec">
                                <label>Category</label>
                                <select className="premium-select" value={category} onChange={e => setCategory(e.target.value)}>
                                    <option>Electronics</option>
                                    <option>Jewelry</option>
                                    <option>Pets</option>
                                    <option>Documents</option>
                                    <option>Accessories</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-sec">
                                <label>Report Protocol</label>
                                <div className="type-toggle-v5">
                                    <button
                                        className={`t-btn-v5 lost ${type === 'lost' ? 'active' : ''}`}
                                        onClick={() => setType('lost')}
                                    >LOST</button>
                                    <button
                                        className={`t-btn-v5 found ${type === 'found' ? 'active' : ''}`}
                                        onClick={() => setType('found')}
                                    >FOUND</button>
                                </div>
                            </div>
                        </div>

                        <div className="form-sec">
                            <label>Contextual Location</label>
                            <div className="input-with-icon">
                                <MapPin size={16} className="i-ico" />
                                <input
                                    type="text"
                                    className="premium-input with-ico"
                                    placeholder="e.g. Near the 2nd floor elevator"
                                    value={locationName}
                                    onChange={e => setLocationName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-sec">
                            <label>Geospatial Precision</label>
                            <div className="loc-selector-v5">
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`loc-method-v5 ${pickingMode === 'current' ? 'active' : ''}`}
                                    onClick={handleUseCurrentLocation}
                                >
                                    <div className="m-ico"><Crosshair size={18} /></div>
                                    <div className="txt">
                                        <strong>Current GPS</strong>
                                        <span>Auto-detect position</span>
                                    </div>
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`loc-method-v5 ${pickingMode === 'manual' ? 'active' : ''}`}
                                    onClick={() => setPickingMode('manual')}
                                >
                                    <div className="m-ico"><MousePointer2 size={18} /></div>
                                    <div className="txt">
                                        <strong>Manual Pin</strong>
                                        <span>Tap map to mark</span>
                                    </div>
                                </motion.button>
                            </div>
                            {coords && (
                                <motion.div
                                    className="coords-badge-v5 animate-fade"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                >
                                    <CheckCircle2 size={14} /> Node Synchronized: {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                                </motion.div>
                            )}
                        </div>

                        <div className="form-sec">
                            <label>Visual Identity (Photo Verification)</label>
                            <motion.div
                                whileHover={{ borderColor: "var(--color-primary)" }}
                                className={`photo-upload-v5-premium ${image ? 'has-image' : ''}`}
                                onClick={() => fileInputRef.current.click()}
                            >
                                {image ? (
                                    <div className="preview-container-v5">
                                        <img src={image} alt="Preview" />
                                        <div className="change-hint-v5">Tap to update visual identification</div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder-v5">
                                        <div className="cam-ico"><Camera size={32} /></div>
                                        <span>Capture or Upload Item Image</span>
                                        <small>Maximum 5MB • JPG, PNG</small>
                                    </div>
                                )}
                            </motion.div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="form-sec">
                            <label>Detailed Specifications</label>
                            <textarea
                                className="premium-textarea"
                                rows="3"
                                placeholder="Unique identifiers, serial numbers, specific damage..."
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                            ></textarea>
                        </div>

                        <motion.button
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary full-width submit-btn-v5"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >
                            {submitting ? 'Encrypting & Sending...' : 'Broadcast to Campus Network'}
                            {!submitting && <Navigation size={18} />}
                        </motion.button>
                    </div>

                    {/* RIGHT MAP */}
                    <div className="report-map-side">
                        <div className="map-frame glass">
                            <MapView
                                userLocation={coords || state.myLocation}
                                items={coords ? [{ id: 'temp', coords, type: type }] : []}
                                schoolBoundary={{
                                    center: userSchool?.coords || state.myLocation,
                                    radius: (userSchool?.radius || 1.0) * 1609.34
                                }}
                                onMapClick={handleMapClick}
                                mapStyle="satellite"
                            />
                            {!coords && (
                                <div className="map-overlay">
                                    <div className="hint-pill">Tap Map to Mark Location</div>
                                </div>
                            )}
                        </div>
                        <div className="map-guidance">
                            <Info size={16} />
                            <span>Precision listing increases recovery rates by 42%.</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .report-v5 { background: #F8FAFC; }
                .report-header-v5 { margin-bottom: 50px; }
                .badge { 
                    display: inline-block; background: #EEF2FF; color: var(--color-primary); 
                    padding: 6px 14px; border-radius: 30px; font-size: 0.8rem; font-weight: 700; margin-bottom: 1.5rem;
                }
                .header-txt h1 { font-size: 2.8rem; color: var(--color-dark); margin-bottom: 0.5rem; }
                .header-txt p { font-size: 1.1rem; color: var(--text-dim); }

                .report-grid-v5 { display: grid; grid-template-columns: 500px 1fr; gap: 40px; }
                
                .report-form { padding: 3rem; border-radius: 40px; background: white; display: flex; flex-direction: column; gap: 1.8rem; box-shadow: var(--shadow-xl); border: 1px solid var(--border-glass); }
                .form-info-card { display: flex; gap: 12px; background: var(--color-primary-soft); color: var(--color-primary-deep); padding: 15px; border-radius: 16px; font-size: 0.85rem; font-weight: 600; line-height: 1.5; }
                
                .form-sec { display: flex; flex-direction: column; gap: 0.8rem; }
                .form-sec label { font-size: 0.85rem; font-weight: 800; color: var(--color-dark); text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.8; }
                
                .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                
                .premium-input, .premium-select, .premium-textarea {
                    background: #F8FAFC; border: 2px solid #F1F5F9; border-radius: 14px; padding: 14px 18px;
                    font-size: 0.95rem; font-weight: 500; font-family: inherit; transition: all 0.2s;
                }
                .premium-input:focus, .premium-select:focus, .premium-textarea:focus { border-color: var(--color-primary); background: white; outline: none; box-shadow: 0 0 0 4px var(--color-primary-soft); }
                
                .input-with-icon { position: relative; }
                .input-with-icon .i-ico { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--color-primary); }
                .with-ico { padding-left: 48px; }

                .type-toggle-v5 { display: flex; background: #F8FAFC; padding: 6px; border-radius: 16px; gap: 8px; border: 2px solid #F1F5F9; }
                .t-btn-v5 { flex: 1; border: none; padding: 12px; border-radius: 12px; cursor: pointer; font-weight: 800; font-size: 0.8rem; transition: all 0.2s; background: transparent; color: var(--text-dim); }
                .t-btn-v5.lost.active { background: #EF4444; color: white; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
                .t-btn-v5.found.active { background: #10B981; color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                
                .loc-selector-v5 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .loc-method-v5 { 
                    display: flex; align-items: center; gap: 12px; padding: 14px;
                    background: white; border: 2px solid #F1F5F9; border-radius: 16px;
                    text-align: left; cursor: pointer; transition: all 0.2s;
                }
                .loc-method-v5.active { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary); }
                .loc-method-v5 .m-ico { width: 40px; height: 40px; background: #F8FAFC; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .loc-method-v5.active .m-ico { background: white; color: var(--color-primary); }
                .loc-method-v5 strong { display: block; font-size: 0.85rem; margin-bottom: 2px; }
                .loc-method-v5 span { font-size: 0.7rem; opacity: 0.7; }
                
                .coords-badge-v5 { 
                    display: inline-flex; align-items: center; gap: 8px; font-size: 0.8rem; 
                    background: #DCFCE7; color: #059669; padding: 8px 16px; border-radius: 10px; font-weight: 700;
                    margin-top: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .photo-upload-v5-premium {
                    border: 2px dashed #CBD5E1;
                    border-radius: 20px;
                    height: 180px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    background: #F8FAFC;
                }
                .photo-upload-v5-premium:hover { border-color: var(--color-primary); background: var(--color-primary-soft); transform: scale(1.01); }
                .photo-upload-v5-premium.has-image { border-style: solid; border-color: #F1F5F9; }
                
                .upload-placeholder-v5 { display: flex; flex-direction: column; align-items: center; gap: 8px; color: var(--text-dim); text-align: center; }
                .upload-placeholder-v5 .cam-ico { width: 64px; height: 64px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; box-shadow: var(--shadow-sm); color: var(--color-primary); }
                .upload-placeholder-v5 span { font-weight: 700; font-size: 0.95rem; color: var(--color-dark); }
                .upload-placeholder-v5 small { font-size: 0.75rem; opacity: 0.6; }

                .preview-container-v5 { position: relative; width: 100%; height: 100%; }
                .preview-container-v5 img { width: 100%; height: 100%; object-fit: cover; }
                .change-hint-v5 { 
                    position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.7); 
                    color: white; font-size: 0.8rem; padding: 12px; text-align: center; backdrop-filter: blur(8px);
                    font-weight: 600;
                }

                .submit-btn-v5 { margin-top: 1rem; height: 64px; font-size: 1.1rem; border-radius: 18px; }

                .report-map-side { display: flex; flex-direction: column; gap: 20px; }
                .map-frame { height: 750px; border-radius: 40px; overflow: hidden; position: relative; box-shadow: var(--shadow-xl); border: 1px solid var(--border-glass); }
                .map-overlay { position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center; z-index: 1000; }
                .hint-pill { background: rgba(15, 23, 42, 0.85); color: white; padding: 14px 28px; border-radius: 40px; font-weight: 700; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); box-shadow: var(--shadow-xl); }
                
                .map-guidance { display: flex; align-items: center; gap: 12px; color: var(--text-dim); font-size: 0.9rem; padding: 15px 25px; background: white; border-radius: 16px; border: 1px solid var(--border-glass); width: fit-content; }
                .map-guidance span { font-weight: 600; }
            `}</style>
        </div>
    );
};

export default Report;
