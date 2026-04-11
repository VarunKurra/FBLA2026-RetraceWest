import React, { useEffect, useRef, useState } from 'react';
import { Navigation, CheckCircle2, Volume2, VolumeX, X, MapPin, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PrecisionNavigator = ({ target }) => {
    const { state, dispatch } = useApp();
    const [distance, setDistance] = useState(0);
    const [angle, setAngle] = useState(0);
    const [isMuted, setIsMuted] = useState(!state.voiceEnabled);
    const [message, setMessage] = useState('Calculating route...');
    const [directionInstruction, setDirectionInstruction] = useState('Preparing...');
    const [isArrived, setIsArrived] = useState(false);
    const [routeGeometry, setRouteGeometry] = useState(null);
    const [routeSteps, setRouteSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [routeError, setRouteError] = useState(null);
    const [routeLoading, setRouteLoading] = useState(true);

    const [initialDistance, setInitialDistance] = useState(null);

    const lastInstructionRef = useRef('');
    const synth = window.speechSynthesis;

    useEffect(() => {
        if (synth && synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => synth.getVoices();
        }
    }, [synth]);

    const speak = (text) => {
        if (isMuted || !synth) return;
        if (lastInstructionRef.current === text) return;

        synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const voices = synth.getVoices();
        const premiumVoice = voices.find(v => v.name.includes("Google US English")) ||
            voices.find(v => v.lang === "en-US" && v.name.includes("Samantha")) ||
            voices.find(v => v.lang === "en-US");

        if (premiumVoice) utterance.voice = premiumVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        synth.speak(utterance);
        lastInstructionRef.current = text;
    };

    // Fetch route ONCE when target changes
    useEffect(() => {
        let cancelled = false;

        const fetchRoute = async () => {
            if (!target.coords) {
                setRouteError('No target coordinates available.');
                setRouteLoading(false);
                return;
            }

            // Use current location or fall back to school center
            const userLoc = state.myLocation || [38.6228, -90.5347];
            const [uLat, uLng] = userLoc;
            const [tLat, tLng] = target.coords;

            setRouteLoading(true);
            setRouteError(null);
            setMessage('Calculating route...');
            setDirectionInstruction('Preparing...');

            try {
                // Use OSRM with 8 second timeout
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 8000);

                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/foot/${uLng},${uLat};${tLng},${tLat}?geometries=geojson&steps=true&overview=full`,
                    { signal: controller.signal }
                );
                clearTimeout(timeout);

                const data = await res.json();

                if (cancelled) return;

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const steps = route.legs[0].steps;

                    setRouteGeometry(route.geometry.coordinates);
                    setRouteSteps(steps);
                    setRouteLoading(false);
                    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route.geometry.coordinates });
                } else {
                    // Fallback: try driving profile
                    const res2 = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${tLng},${tLat}?geometries=geojson&steps=true&overview=full`
                    );
                    const data2 = await res2.json();

                    if (cancelled) return;

                    if (data2.routes && data2.routes.length > 0) {
                        const route = data2.routes[0];
                        const steps = route.legs[0].steps;
                        setRouteGeometry(route.geometry.coordinates);
                        setRouteSteps(steps);
                        setRouteLoading(false);
                        dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route.geometry.coordinates });
                    } else {
                        setRouteError('Could not calculate route. Navigate directly to the pin on the map.');
                        setRouteLoading(false);
                    }
                }
            } catch (error) {
                if (cancelled) return;
                console.error("Routing Error:", error);

                if (error.name === 'AbortError') {
                    setRouteError('Route calculation timed out. Navigate directly using the pin on the map.');
                } else {
                    setRouteError('Route calculation failed. Navigate directly using the pin on the map.');
                }
                setRouteLoading(false);

                // Still show direct distance as fallback
                const dx = (tLat - uLat) * 364567;
                const dy = (tLng - uLng) * 284483;
                const directDist = Math.sqrt(dx * dx + dy * dy);
                setDistance(Math.round(directDist));
                setDirectionInstruction('Navigate to pin');
                setMessage(`Head towards the marker. Approximately ${Math.round(directDist)} ft away.`);
            }
        };

        fetchRoute();

        return () => {
            cancelled = true;
            dispatch({ type: 'SET_ACTIVE_ROUTE', payload: null });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target.coords, dispatch]);

    useEffect(() => {
        if (!routeSteps || routeSteps.length === 0) return;

        const updateCalculations = () => {
            if (!state.myLocation) return;

            const [uLat, uLng] = state.myLocation;
            const [tLat, tLng] = target.coords;

            // Direct distance to target (in feet) for arrival threshold
            const dx = (tLat - uLat) * 364567;
            const dy = (tLng - uLng) * 284483;
            const directDist = Math.sqrt(dx * dx + dy * dy);

            // Distance along route (meters to feet)
            let remainingMeters = 0;
            for (let i = currentStepIndex; i < routeSteps.length; i++) {
                remainingMeters += routeSteps[i].distance;
            }

            const distFeet = remainingMeters * 3.28084;
            const currentDistStr = distFeet.toFixed(0);

            setDistance(currentDistStr);
            if (initialDistance === null) setInitialDistance(distFeet);

            // Determine heading based on next coordinate in step
            if (routeGeometry && routeGeometry.length > 1) {
                const nextCoord = routeGeometry[1];
                const rdx = nextCoord[0] - uLng;
                const rdy = nextCoord[1] - uLat;
                const rad = Math.atan2(rdy, rdx);
                setAngle((rad * 180) / Math.PI);
            }

            if (directDist < 15 || distFeet < 15) {
                setIsArrived(true);
                setDirectionInstruction("Arrived");
                setMessage("You've reached the reporting zone.");
                speak("You have arrived at the location. Look around for the item.");
            } else if (distFeet < 50) {
                setIsArrived(false);
                setDirectionInstruction("Approaching");
                setMessage(`Searching within 50 feet. Look near ${target.location || target.location_name || 'the marker'}.`);
                speak(`The item should be within 50 feet of you now.`);
            } else {
                setIsArrived(false);

                const currentStep = routeSteps[currentStepIndex];
                const nextStep = currentStepIndex + 1 < routeSteps.length ? routeSteps[currentStepIndex + 1] : null;

                if (currentStep) {
                    if (currentStep.distance < 15 && nextStep) {
                        setCurrentStepIndex(prev => prev + 1);
                    }
                }

                const feetToNextManeuver = currentStep ? Math.round(currentStep.distance * 3.28084) : 0;

                const upcomingStep = nextStep || currentStep;
                const nextInstruction = upcomingStep?.maneuver?.instruction || 'Continue to destination';
                const nextStreet = upcomingStep?.name || '';
                const nextModifier = upcomingStep?.maneuver?.modifier || '';
                const nextType = upcomingStep?.maneuver?.type || '';

                const currentRoad = currentStep?.name || '';

                let shortTitle = 'Navigate';
                if (nextStep) {
                    if (nextModifier.includes('left')) shortTitle = '↰ Turn Left';
                    else if (nextModifier.includes('right')) shortTitle = '↱ Turn Right';
                    else if (nextModifier.includes('straight')) shortTitle = '↑ Straight';
                    else if (nextType === 'roundabout') shortTitle = '⟳ Roundabout';
                    else if (nextType === 'arrive') shortTitle = '◉ Arriving';
                    else shortTitle = '↑ Continue';
                } else {
                    shortTitle = '◉ Arriving';
                }

                let fullMessage = '';
                if (nextStep && feetToNextManeuver > 0) {
                    fullMessage = `In ${feetToNextManeuver} ft, ${nextInstruction.toLowerCase()}`;
                    if (nextStreet && !nextInstruction.includes(nextStreet)) {
                        fullMessage += ` onto ${nextStreet}`;
                    }
                } else if (nextStep) {
                    fullMessage = nextInstruction;
                    if (nextStreet && !nextInstruction.includes(nextStreet)) {
                        fullMessage += ` onto ${nextStreet}`;
                    }
                } else {
                    fullMessage = `Continue${currentRoad ? ' on ' + currentRoad : ''} to destination`;
                }

                if (currentRoad && nextStep) {
                    fullMessage += `. Currently on ${currentRoad}.`;
                }

                setDirectionInstruction(shortTitle);
                setMessage(fullMessage);

                let voiceMsg = '';
                if (nextStep && feetToNextManeuver > 50) {
                    voiceMsg = `In ${feetToNextManeuver} feet, ${nextInstruction.toLowerCase()}${nextStreet ? ' onto ' + nextStreet : ''}`;
                } else if (nextStep) {
                    voiceMsg = `${nextInstruction}${nextStreet ? ' onto ' + nextStreet : ''} now`;
                } else {
                    voiceMsg = `Continue to destination. ${currentDistStr} feet remaining.`;
                }
                speak(voiceMsg);
            }
        };

        updateCalculations();
        const intervalId = setInterval(updateCalculations, 1000);

        return () => clearInterval(intervalId);
    }, [state.myLocation, target, isMuted, initialDistance, routeSteps, routeGeometry, currentStepIndex]);

    const handleClaim = () => {
        dispatch({ type: 'CLAIM_ITEM', payload: target.id });
    };

    const handleLeave = () => {
        dispatch({ type: 'STOP_NAVIGATION' });
    };

    const etaSeconds = Math.max(0, Math.floor(distance / 4));
    const progressPercent = initialDistance ? Math.max(0, Math.min(100, 100 - ((distance / initialDistance) * 100))) : 0;

    return (
        <div
            className="floating-navigator glass"
            style={{ animation: 'fadeUp 0.3s ease-out' }}
        >
            <div className="nav-header">
                <button className="icon-btn-ghost" onClick={handleLeave}>
                    <X size={20} />
                </button>
                <button className="icon-btn-ghost" onClick={() => setIsMuted(!isMuted)}>
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
            </div>

            <div className="nav-body">
                <div className="nav-icon-large">
                    {routeLoading ? (
                        <div className="spin" style={{ color: 'var(--color-primary)' }}>
                            <Navigation size={48} />
                        </div>
                    ) : isArrived ? (
                        <div className="arrival-pulse">
                            <CheckCircle2 size={48} color="#10B981" />
                        </div>
                    ) : routeError ? (
                        <AlertCircle size={48} color="#f59e0b" />
                    ) : (
                        <Navigation
                            size={48}
                            color="var(--color-primary)"
                            style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.5s ease-out' }}
                        />
                    )}
                </div>

                <div className="nav-instructions">
                    <h1>{routeLoading ? 'Calculating...' : directionInstruction}</h1>
                    <p>{routeLoading ? 'Fetching the best route for you...' : message}</p>
                    {routeError && (
                        <p style={{ color: '#b45309', fontSize: '0.8rem', marginTop: 8, fontWeight: 600 }}>{routeError}</p>
                    )}
                </div>
            </div>

            <div className="nav-footer">
                {!isArrived ? (
                    <>
                        <div className="nav-stats">
                            <div className="n-stat">
                                <strong>{routeLoading ? '—' : `${distance} ft`}</strong>
                                <span>Remaining</span>
                            </div>
                            <div className="n-stat">
                                <strong>{routeLoading ? '—' : `${Math.ceil(etaSeconds / 60)} min`}</strong>
                                <span>ETA</span>
                            </div>
                        </div>
                        {!routeLoading && (
                            <div className="nav-progress-bar">
                                <div className="nav-progress-fill" style={{ width: `${progressPercent}%` }} />
                            </div>
                        )}
                    </>
                ) : (
                    <div className="arrival-actions animate-fade">
                        <button className="btn-success full-width" onClick={handleClaim}>
                            <CheckCircle2 size={18} /> Claim Lost Item
                        </button>
                        <button className="btn-ghost full-width mt-2" onClick={handleLeave}>
                            Leave it here
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                .floating-navigator {
                    position: absolute;
                    top: 120px;
                    left: 20px;
                    width: 320px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(20px);
                    border-radius: 24px;
                    border: 1px solid var(--border-glass);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    z-index: 2000;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .nav-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 15px 20px 0;
                }
                
                .nav-body {
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 15px;
                }
                
                .nav-icon-large {
                    width: 80px;
                    height: 80px;
                    border-radius: 50%;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
                }

                .arrival-pulse {
                    animation: pulseSuccess 2s infinite;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .nav-instructions h1 {
                    font-size: 2rem;
                    color: var(--color-dark);
                    margin-bottom: 5px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                }
                
                .nav-instructions p {
                    color: var(--text-dim);
                    font-size: 0.95rem;
                    line-height: 1.4;
                }
                
                .nav-footer {
                    padding: 20px;
                    background: var(--bg-secondary);
                    border-top: 1px solid var(--border-glass);
                }
                
                .nav-stats {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 15px;
                }
                
                .n-stat {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }
                
                .n-stat strong {
                    font-size: 1.5rem;
                    color: var(--color-dark);
                    font-weight: 800;
                }
                
                .n-stat span {
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    color: var(--text-dim);
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                
                .nav-progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #E2E8F0;
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .nav-progress-fill {
                    height: 100%;
                    background: var(--color-primary);
                    border-radius: 10px;
                    transition: width 0.3s ease;
                }

                .arrival-actions { display: flex; flex-direction: column; gap: 10px; }
                .full-width { width: 100%; justify-content: center; padding: 16px; font-size: 1.1rem; }
                .mt-2 { margin-top: 5px; }
                .icon-btn-ghost { background: transparent; border: none; cursor: pointer; color: var(--text-dim); transition: 0.2s; padding: 8px; border-radius: 50%; }
                .icon-btn-ghost:hover { background: rgba(0,0,0,0.05); color: var(--color-dark); }
                .spin { animation: spin 1.5s linear infinite; display: inline-flex; }
                @keyframes spin { 100% { transform: rotate(360deg); } }

                @keyframes pulseSuccess {
                    0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(16, 185, 129, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
                }

                @media (max-width: 768px) {
                    .floating-navigator {
                        top: 20px;
                        left: 50%;
                        transform: translateX(-50%) !important;
                        width: 90%;
                        max-width: 400px;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrecisionNavigator;
