import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Navigation, CheckCircle2, Volume2, VolumeX, X, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const PrecisionNavigator = ({ target, onArrival }) => {
    const { state, dispatch } = useApp();
    const [distance, setDistance] = useState(0);
    const [angle, setAngle] = useState(0);
    const [isMuted, setIsMuted] = useState(!state.voiceEnabled);
    const [message, setMessage] = useState('Finding your current position...');
    const [directionInstruction, setDirectionInstruction] = useState('Determining route...');
    const [isArrived, setIsArrived] = useState(false);
    const [routeCoords, setRouteCoords] = useState([]);
    const [routeGeometry, setRouteGeometry] = useState(null);
    const [routeSteps, setRouteSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

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

    // Fetch route ONCE when target changes, using current location at that moment
    useEffect(() => {
        let cancelled = false;

        const fetchRoute = async () => {
            if (!state.myLocation || !target.coords) return;

            const [uLat, uLng] = state.myLocation;
            const [tLat, tLng] = target.coords;

            console.log('Fetching route from', [uLat, uLng], 'to', [tLat, tLng]);

            try {
                // Use OSRM 'driving' profile for detailed turn-by-turn with street names
                // The 'foot' profile only returns "Head towards destination" with no details
                const res = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${tLng},${tLat}?geometries=geojson&steps=true&overview=full&annotations=true`
                );
                const data = await res.json();

                if (cancelled) return;

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    const steps = route.legs[0].steps;

                    console.log('Route obtained:', route.geometry.coordinates.length, 'points,', steps.length, 'steps');
                    steps.forEach((s, i) => console.log(`  Step ${i}: ${s.maneuver?.instruction} (${Math.round(s.distance * 3.28)}ft)`));

                    setRouteGeometry(route.geometry.coordinates);
                    setRouteSteps(steps);
                    dispatch({ type: 'SET_ACTIVE_ROUTE', payload: route.geometry.coordinates });
                }
            } catch (error) {
                console.error("Routing Error:", error);
            }
        };

        fetchRoute();

        // Cleanup ONLY on unmount or target change — NOT on every GPS tick
        return () => {
            cancelled = true;
            dispatch({ type: 'SET_ACTIVE_ROUTE', payload: null });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target.coords, dispatch]); // DO NOT include state.myLocation — that causes refresh loop

    useEffect(() => {
        const updateCalculations = () => {
            if (!routeSteps || routeSteps.length === 0) return;

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
            let targetHeading = null;
            if (routeGeometry && routeGeometry.length > 1) {
                const nextCoord = routeGeometry[1]; // simplified assumption for heading
                const rdx = nextCoord[0] - uLng;
                const rdy = nextCoord[1] - uLat;
                const rad = Math.atan2(rdy, rdx);
                targetHeading = (rad * 180) / Math.PI;
                setAngle(targetHeading);
            }

            if (directDist < 15 || distFeet < 15) {
                setIsArrived(true);
                setDirectionInstruction("Arrived");
                setMessage("You've reached the reporting zone.");
                speak("You have arrived at the location. Look around for the item.");
            } else if (distFeet < 50) {
                setIsArrived(false);
                setDirectionInstruction("Approaching");
                setMessage(`Searching within 50 feet. Look near ${target.location}.`);
                speak(`The item should be within 50 feet of you now. Look around ${target.location}.`);
            } else {
                setIsArrived(false);

                // ═══ Google Maps-style directions ═══
                // Show distance until the NEXT maneuver, and what that maneuver is.
                // Current step = what you're doing now (walking/driving on a road)
                // Next step = what's coming up (the turn)

                const currentStep = routeSteps[currentStepIndex];
                const nextStep = currentStepIndex + 1 < routeSteps.length ? routeSteps[currentStepIndex + 1] : null;

                if (currentStep) {
                    // Advance step when close enough
                    if (currentStep.distance < 15 && nextStep) {
                        setCurrentStepIndex(prev => prev + 1);
                    }
                }

                // Distance until the NEXT maneuver (current step's remaining distance)
                const feetToNextManeuver = currentStep ? Math.round(currentStep.distance * 3.28084) : 0;

                // What is the next action?
                const upcomingStep = nextStep || currentStep;
                const nextInstruction = upcomingStep?.maneuver?.instruction || 'Continue to destination';
                const nextStreet = upcomingStep?.name || '';
                const nextModifier = upcomingStep?.maneuver?.modifier || '';
                const nextType = upcomingStep?.maneuver?.type || '';

                // Current road
                const currentRoad = currentStep?.name || '';

                // ── Build the short title (big text) ──
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

                // ── Build the full message (detail text) ──
                let fullMessage = '';
                if (nextStep && feetToNextManeuver > 0) {
                    // "In 500 feet, turn left onto Baxter Road"
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

                // Add current road context
                if (currentRoad && nextStep) {
                    fullMessage += `. Currently on ${currentRoad}.`;
                }

                setDirectionInstruction(shortTitle);
                setMessage(fullMessage);

                // Speak the upcoming direction — speak() auto-deduplicates
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

        // Real app would use a geolocation watcher interval here, for now it runs on myLocation change
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
        <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="floating-navigator glass"
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
                    {isArrived ? (
                        <div className="arrival-pulse">
                            <CheckCircle2 size={48} color="#10B981" />
                        </div>
                    ) : (
                        <Navigation
                            size={48}
                            color="var(--color-primary)"
                            style={{ transform: `rotate(${angle}deg)`, transition: 'transform 0.5s ease-out' }}
                        />
                    )}
                </div>

                <div className="nav-instructions">
                    <h1>{directionInstruction}</h1>
                    <p>{message}</p>
                </div>
            </div>

            <div className="nav-footer">
                {!isArrived ? (
                    <>
                        <div className="nav-stats">
                            <div className="n-stat">
                                <strong>{distance} ft</strong>
                                <span>Remaining</span>
                            </div>
                            <div className="n-stat">
                                <strong>{Math.ceil(etaSeconds / 60)} min</strong>
                                <span>ETA</span>
                            </div>
                        </div>
                        <div className="nav-progress-bar">
                            <div className="nav-progress-fill" style={{ width: `${progressPercent}%` }} />
                        </div>
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

            <style jsx>{`
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
        </motion.div>
    );
};

export default PrecisionNavigator;
