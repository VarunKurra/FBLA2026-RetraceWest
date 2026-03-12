import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { MISSOURI_SCHOOLS } from '../data/missouriSchools';

const AppContext = createContext();

const PERSIST_KEY = 'retrace_v5_state_persisted';

const getInitialState = () => {
    const defaultState = {
        user: null,
        myLocation: [38.6230, -90.5345], // Defaulting to Parkway West Area
        items: [
            {
                id: 'pw-1',
                schoolId: 'parkway-west',
                type: 'lost',
                title: 'Scientific Calculator (TI-84)',
                category: 'Electronics',
                location: 'Math Wing Lounge',
                coords: [38.6235, -90.5349],
                reporter: 'Sarah Miller',
                status: 'listed',
                timestamp: Date.now() - 3600000,
                desc: 'Black TI-84 Plus CE, has a sticker of a cat on the back.'
            },
            {
                id: 'pw-2',
                schoolId: 'parkway-west',
                type: 'found',
                title: 'Set of Car Keys',
                category: 'Accessories',
                location: 'Main Parking Lot (Row B)',
                coords: [38.6224, -90.5339],
                reporter: 'Coach J.',
                status: 'listed',
                timestamp: Date.now() - 7200000,
                desc: 'Honda key fob with a blue carabiner.'
            },
            {
                id: 'pw-3',
                schoolId: 'parkway-west',
                type: 'lost',
                title: 'Blue North Face Jacket',
                category: 'Accessories',
                location: 'Old Gym Bleachers',
                coords: [38.6239, -90.5354],
                reporter: 'Alex K.',
                status: 'listed',
                timestamp: Date.now() - 86400000,
                desc: 'Navy blue puffer jacket, size Large.'
            },
            {
                id: 'pw-4',
                schoolId: 'parkway-west',
                type: 'lost',
                title: 'AirPods Pro (Case 3)',
                category: 'Electronics',
                location: 'Library Quiet Zone',
                coords: [38.6232, -90.5342],
                reporter: 'James Wilson',
                status: 'listed',
                timestamp: Date.now() - 1800000,
                desc: 'Case has a small scratch near the charging port.'
            },
            {
                id: 'pw-5',
                schoolId: 'parkway-west',
                type: 'found',
                title: 'Black HydroFlask',
                category: 'Accessories',
                location: 'Cafeteria Near Window',
                coords: [38.6237, -90.5346],
                reporter: 'Maintenance Staff',
                status: 'listed',
                timestamp: Date.now() - 300000,
                desc: '32oz bottle with stickers of several Missouri landmarks.'
            },
            {
                id: 'pw-6',
                schoolId: 'parkway-west',
                type: 'found',
                title: 'Student ID Card',
                category: 'Documents',
                location: 'Main Office Counter',
                coords: [38.6229, -90.5344],
                reporter: 'Secretary Brown',
                status: 'listed',
                timestamp: Date.now() - 900000,
                desc: 'ID card for a Junior student. Please visit the office to claim.'
            },
            {
                id: 'pw-7',
                schoolId: 'parkway-west',
                type: 'lost',
                title: 'Gold Necklace with Heart Pendant',
                category: 'Jewelry',
                location: 'Girls Locker Room',
                coords: [38.6242, -90.5352],
                reporter: 'Emily Chen',
                status: 'listed',
                timestamp: Date.now() - 43200000,
                desc: 'Thin gold chain, very sentimental value.'
            },
            {
                id: 'pw-8',
                schoolId: 'parkway-west',
                type: 'found',
                title: 'MacBook Charger (USB-C)',
                category: 'Electronics',
                location: 'Science Lab 204',
                coords: [38.6234, -90.5344],
                reporter: 'Mr. Davis',
                status: 'listed',
                timestamp: Date.now() - 86400000,
                desc: 'Left plugged into wall socket near the back door.'
            },
            {
                id: 'pw-9',
                schoolId: 'parkway-west',
                type: 'lost',
                title: 'Small Black Wallet',
                category: 'Accessories',
                location: 'Hallway by Auditorium',
                coords: [38.6236, -90.5334],
                reporter: 'Michael T.',
                status: 'listed',
                timestamp: Date.now() - 10800000,
                desc: 'Leather wallet. Contains some cash and a student ID. Please return ASAP.'
            }

        ],
        activeItem: null,
        activeRoute: null,
        voiceEnabled: true,
        captchaSolved: false,
    };

    const stored = localStorage.getItem(PERSIST_KEY);
    if (stored) {
        try {
            const parsed = JSON.parse(stored);
            return {
                ...defaultState,
                ...parsed,
                // ALWAYS reset these on load — GPS watcher will set real location immediately
                myLocation: defaultState.myLocation,
                captchaSolved: false,
                activeRoute: null,
                activeItem: null,
            };
        } catch (e) {
            console.error("Failed to parse stored state", e);
        }
    }
    return defaultState;
};


function appReducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            // NEVER override myLocation here — the geolocation watcher handles real GPS.
            // LOGIN only sets user data.
            return {
                ...state,
                user: action.payload,
            };
        case 'LOGOUT':
            import('../supabaseClient').then(({ supabase }) => supabase.auth.signOut());
            return { ...state, user: null, activeItem: null };
        case 'SET_ITEMS':
            return { ...state, items: action.payload };
        case 'TOGGLE_WAITLIST':
            const currentWaitlist = state.user?.waitlist || [];
            const itemId = action.payload;
            const newWaitlist = currentWaitlist.includes(itemId)
                ? currentWaitlist.filter(id => id !== itemId)
                : [...currentWaitlist, itemId];

            // Note: In a real app we'd update Supabase here, but we will store it in the state auth object for now
            return {
                ...state,
                user: {
                    ...state.user,
                    waitlist: newWaitlist
                }
            };
        case 'START_NAVIGATION':
            return { ...state, activeItem: action.payload };
        case 'STOP_NAVIGATION':
            return { ...state, activeItem: null, activeRoute: null };
        case 'SET_ACTIVE_ROUTE':
            return { ...state, activeRoute: action.payload };
        case 'ADD_ITEM':
            return { ...state, items: [action.payload, ...state.items] };
        case 'CLAIM_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.payload), activeItem: null };
        case 'APPROVE_ADMIN':
            if (state.user?.role === 'admin') {
                return { ...state, user: { ...state.user, approved: true } };
            }
            return state;
        case 'UPDATE_LOCATION':
            return { ...state, myLocation: action.payload };
        case 'TOGGLE_VOICE':
            return { ...state, voiceEnabled: !state.voiceEnabled };
        case 'SOLVE_CAPTCHA':
            return { ...state, captchaSolved: true };
        default:
            return state;
    }
}

export const AppProvider = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, null, getInitialState);

    // Persist state changes
    useEffect(() => {
        localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
    }, [state]);

    // Handle Geolocation
    useEffect(() => {
        if ("geolocation" in navigator) {
            // Get initial position immediately
            navigator.geolocation.getCurrentPosition(
                (pos) => dispatch({ type: 'UPDATE_LOCATION', payload: [pos.coords.latitude, pos.coords.longitude] }),
                (err) => console.log('Initial location error:', err),
                { enableHighAccuracy: true }
            );

            const watcher = navigator.geolocation.watchPosition(
                (pos) => dispatch({ type: 'UPDATE_LOCATION', payload: [pos.coords.latitude, pos.coords.longitude] }),
                (err) => console.log('Location error:', err),
                { enableHighAccuracy: true }
            );
            return () => navigator.geolocation.clearWatch(watcher);
        }
    }, []);

    // Supabase Initialization & Data Fetch
    useEffect(() => {
        let mounted = true;
        import('../supabaseClient').then(({ supabase }) => {
            // Fetch initial session
            supabase.auth.getSession().then(({ data: { session } }) => {
                if (session && mounted) {
                    dispatch({ type: 'LOGIN', payload: { ...session.user.user_metadata, id: session.user.id } });
                }
            });

            // Listen for auth changes
            supabase.auth.onAuthStateChange((_event, session) => {
                if (session && mounted) {
                    dispatch({ type: 'LOGIN', payload: { ...session.user.user_metadata, id: session.user.id } });
                }
            });

            // Fetch Items
            supabase.from('items').select('*').then(({ data, error }) => {
                if (!error && data && data.length > 0 && mounted) {
                    dispatch({ type: 'SET_ITEMS', payload: data });
                } else if (error) {
                    console.warn("Could not fetch items from Supabase, using local defaults.", error.message);
                }
            });
        });

        return () => { mounted = false; };
    }, []);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
export { MISSOURI_SCHOOLS };
