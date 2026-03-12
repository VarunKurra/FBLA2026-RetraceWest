import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map as MapIcon, Compass, Crosshair, Navigation, Info, Layers } from 'lucide-react';
import MapView from '../components/MapView';
import { useApp } from '../context/AppContext';
import { MISSOURI_SCHOOLS } from '../data/missouriSchools';
import { useNavigate } from 'react-router-dom';
import PrecisionNavigator from '../components/PrecisionNavigator';

const SpatialMap = () => {
    const { state, dispatch } = useApp();
    const navigate = useNavigate();
    const [selectedItem, setSelectedItem] = useState(null);
    const [mapStyle, setMapStyle] = useState('satellite');

    if (!state.user) {
        return (
            <div className="map-page-v5 empty page-wrapper">
                <div className="container">
                    <div className="glass empty-card animate-fade">
                        <div className="ico-circ-xl">
                            <Compass size={48} />
                        </div>
                        <h2>Campus Map Restricted</h2>
                        <p>Please establish your school profile to view local recovery nodes and navigate your campus.</p>
                        <button className="btn-primary" onClick={() => navigate('/auth')}>Sign In To School</button>
                    </div>
                </div>
            </div>
        );
    }

    const userSchool = MISSOURI_SCHOOLS.find(s => s.id === state.user.schoolId);
    const schoolItems = state.items.filter(item => item.schoolId === state.user.schoolId);

    // If there is an active navigation item, we shouldn't show the basic HUD, we show the real navigator.
    const isNavigating = !!state.activeItem;

    return (
        <div className="map-page-v5">
            <div className="map-ui-v5">
                {/* Map Header / Legend */}
                <div className="map-legend glass animate-fade">
                    <div className="l-top">
                        <div className="pulse-dot" />
                        <div className="l-txt">
                            <h3>{userSchool?.name || 'Local Campus'}</h3>
                            <span>{schoolItems.length} active reports listed</span>
                        </div>
                    </div>
                    <div className="l-stats">
                        <div className="l-stat">
                            <strong>{userSchool?.radius || 1.0} MI</strong>
                            <span>Watch Radius</span>
                        </div>
                        <div className="l-stat">
                            <strong>±0.5ft</strong>
                            <span>GPS Precision</span>
                        </div>
                    </div>
                </div>

                {/* Map Style Toggle */}
                <div className="map-style-toggle glass">
                    <button className={`style-btn ${mapStyle === 'street' ? 'active' : ''}`} onClick={() => setMapStyle('street')}>
                        <MapIcon size={16} /> Street
                    </button>
                    <button className={`style-btn ${mapStyle === 'satellite' ? 'active' : ''}`} onClick={() => setMapStyle('satellite')}>
                        <Layers size={16} /> Satellite
                    </button>
                </div>

                {/* Google Maps Style Routing Sidebar */}
                <AnimatePresence>
                    {isNavigating && (
                        <PrecisionNavigator
                            target={state.activeItem}
                            onArrival={() => dispatch({ type: 'STOP_NAVIGATION' })}
                        />
                    )}
                </AnimatePresence>

                {/* Bottom Action HUD (Only shown if NOT navigating and an item IS selected) */}
                <AnimatePresence>
                    {selectedItem && !isNavigating && (
                        <motion.div
                            initial={{ opacity: 0, y: 50, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 50, x: '-50%' }}
                            className="item-preview-hud glass"
                        >
                            <div className="h-left">
                                <div className={`h-badge ${selectedItem.type}`}>{selectedItem.type.toUpperCase()}</div>
                                <div className="h-main">
                                    <h2>{selectedItem.title}</h2>
                                    <p>{selectedItem.location}</p>
                                </div>
                            </div>
                            <div className="h-right">
                                <button className="btn-ghost" onClick={() => setSelectedItem(null)}>Close</button>
                                <button className="btn-primary" onClick={() => {
                                    dispatch({ type: 'START_NAVIGATION', payload: selectedItem });
                                    setSelectedItem(null); // Hide this HUD
                                }}>
                                    <Navigation size={18} /> Directions
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!selectedItem && !isNavigating && (
                    <div className="map-hint glass animate-fade">
                        <Info size={16} /> Tap a marker on the map to view item details and start navigation.
                    </div>
                )}
            </div>

            <div className="map-container-v5">
                <MapView
                    userLocation={state.myLocation}
                    items={schoolItems}
                    schoolBoundary={{
                        center: userSchool?.coords || state.myLocation,
                        radius: (userSchool?.radius || 1.0) * 1609.34 // miles to meters
                    }}
                    onItemSelect={(item) => !isNavigating && setSelectedItem(item)}
                    mapStyle={mapStyle}
                    activeRoute={state.activeRoute}
                />
            </div>

            <style jsx>{`
        .map-page-v5 { width: 100%; height: 100vh; position: relative; background: #E2E8F0; overflow: hidden; }
        .map-page-v5.empty { display: flex; align-items: center; justify-content: center; background: #F8FAFC; }
        .empty-card { padding: 4rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }

        .map-ui-v5 { position: absolute; inset: 0; pointer-events: none; z-index: 1000; padding: 120px 20px 20px; }
        .map-ui-v5 > * { pointer-events: auto; }

        .map-legend { 
          position: absolute; top: 120px; left: 20px;
          width: 320px; padding: 25px; border-radius: 25px; background: white; 
          box-shadow: var(--shadow-xl); border: 2px solid var(--color-primary);
        }
        
        .map-style-toggle {
            position: absolute; top: 120px; right: 20px;
            display: flex; gap: 5px; padding: 8px; border-radius: 20px;
            background: rgba(255,255,255,0.9); box-shadow: var(--shadow-lg);
        }
        .style-btn {
            display: flex; align-items: center; gap: 8px; padding: 10px 16px; 
            border: none; border-radius: 12px; font-weight: 600; cursor: pointer;
            background: transparent; color: var(--text-dim); transition: all 0.2s;
        }
        .style-btn:hover { background: rgba(0,0,0,0.05); }
        .style-btn.active { background: var(--color-primary); color: white; }

        .l-top { display: flex; align-items: center; gap: 15px; margin-bottom: 20px; }
        .pulse-dot { width: 10px; height: 10px; background: var(--color-secondary); border-radius: 50%; box-shadow: 0 0 10px var(--color-secondary); animation: blink 1.5s infinite; }
        .l-txt h3 { font-size: 1.1rem; line-height: 1.2; color: var(--color-dark); }
        .l-txt span { font-size: 0.8rem; color: var(--text-dim); font-weight: 600; }
        
        .l-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; border-top: 1px solid var(--border-glass); padding-top: 15px; }
        .l-stat { display: flex; flex-direction: column; }
        .l-stat strong { font-size: 1.1rem; color: var(--color-primary); }
        .l-stat span { font-size: 0.7rem; color: var(--text-dim); text-transform: uppercase; font-weight: 700; }

        .item-preview-hud { 
          position: absolute; bottom: 40px; left: 50%;
          /* Fixed centering to avoid flinging bounds */
          width: 90%; max-width: 600px; padding: 20px; border-radius: 24px; 
          display: flex; align-items: center; justify-content: space-between;
          background: white; border: 1px solid var(--border-glass); box-shadow: var(--shadow-2xl);
          flex-wrap: wrap; gap: 15px;
        }
        @media (max-width: 768px) {
            .item-preview-hud {
                flex-direction: column; align-items: flex-start;
                padding: 15px; bottom: 20px; border-radius: 16px;
            }
            .h-right { width: 100%; display: flex; justify-content: flex-end; }
        }

        .h-left { display: flex; align-items: center; gap: 20px; }
        .h-badge { padding: 4px 12px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; }
        .h-badge.lost { background: #FEE2E2; color: #EF4444; }
        .h-badge.found { background: #DCFCE7; color: #10B981; }
        .h-main h2 { font-size: 1.5rem; color: var(--color-dark); margin-bottom: 4px; }
        .h-main p { color: var(--text-dim); font-size: 0.9rem; }
        .h-right { display: flex; gap: 10px; }

        .map-hint { 
           position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
           background: var(--color-dark); color: white; padding: 12px 24px; border-radius: 40px;
           font-size: 0.9rem; display: flex; align-items: center; gap: 8px; opacity: 0.9;
        }
        @media (max-width: 768px) {
             .map-hint { bottom: 20px; width: 90%; max-width: 400px; justify-content: center; text-align: center; }
        }

        .map-container-v5 { width: 100%; height: 100%; }

        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

        /* ── Map Responsive ── */
        @media (max-width: 1024px) {
          .map-legend { width: 260px; padding: 20px; }
        }
        @media (max-width: 768px) {
          .map-ui-v5 { padding: 80px 12px 12px; }
          .map-legend { 
            top: 80px; left: 12px; right: 12px; width: auto;
            padding: 16px; border-radius: 16px;
          }
          .map-style-toggle { top: 80px; right: 12px; top: auto; bottom: 80px; padding: 6px; border-radius: 14px; }
          .l-txt h3 { font-size: 0.95rem; }
          .l-stats { gap: 10px; }
          .h-main h2 { font-size: 1.2rem; }
          .item-preview-hud { bottom: 80px; border-radius: 18px; }
          .map-hint { bottom: 80px; font-size: 0.8rem; padding: 10px 16px; }
        }
        @media (max-width: 480px) {
          .map-ui-v5 { padding: 70px 8px 8px; }
          .map-legend { top: 70px; padding: 12px; border-radius: 14px; }
          .l-top { gap: 10px; margin-bottom: 12px; }
          .l-txt h3 { font-size: 0.85rem; }
          .map-style-toggle { bottom: 70px; }
          .item-preview-hud { bottom: 70px; padding: 12px; }
          .h-main h2 { font-size: 1rem; }
          .h-main p { font-size: 0.8rem; }
          .map-hint { bottom: 70px; width: 95%; font-size: 0.75rem; }
        }
      `}</style>
        </div>
    );
};

export default SpatialMap;
