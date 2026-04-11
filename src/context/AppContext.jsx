import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PARKWAY_WEST, MISSOURI_SCHOOLS } from '../data/missouriSchools';
import { EXAMPLE_ITEMS } from '../data/exampleItems';

const AppContext = createContext();

// local storage key -- bumped version since schema changed
const PERSIST_KEY = 'trackback_pw_v4_state';

const getInitialState = () => {
  const defaultState = {
    user: null,
    myLocation: PARKWAY_WEST.coords, // default to West High parking lot
    items: EXAMPLE_ITEMS,
    activeItem: null,
    activeRoute: null,
    voiceEnabled: true,
    captchaSolved: false,
    notifications: [], // in-app alert notifications
  };

  const stored = localStorage.getItem(PERSIST_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // merge stored items with defaults, avoiding duplicates
      const fetched = parsed.items || [];
      const existingIds = new Set(fetched.map(i => i.id));
      const merged = [
        ...fetched,
        ...defaultState.items.filter(i => !existingIds.has(i.id))
      ];
      return {
        ...defaultState,
        ...parsed,
        items: merged,
        // always reset these on page load
        myLocation: defaultState.myLocation,
        captchaSolved: false,
        activeRoute: null,
        activeItem: null,
      };
    } catch (e) {
      console.warn('Failed to parse stored state, starting fresh', e.message);
    }
  }
  return defaultState;
};

function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      // fire off the supabase sign out but don't wait for it
      import('../supabaseClient').then(({ supabase }) => supabase.auth.signOut());
      return { ...state, user: null, activeItem: null, notifications: [] };

    case 'UPDATE_USER_POINTS':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, points: action.payload } };

    case 'SET_ITEMS': {
      const fetched = action.payload || [];
      
      // Override coordinates of any seeded example items to force our new left/down shifting
      const updatedFetched = fetched.map(item => {
        const localMatch = EXAMPLE_ITEMS.find(e => e.id === item.id || e.title === item.title);
        if (localMatch) {
          return { ...item, coords: localMatch.coords };
        }
        if (item.coords && item.coords.length === 2 && item.coords[1] > -90.5360) {
          // If there are real user-reported items that are also stuck in the top right, shift them heavily left and a bit down
          return { ...item, coords: [item.coords[0] - 0.0015, item.coords[1] - 0.0035] };
        }
        return item;
      });

      const existingIds = new Set(updatedFetched.map(i => i.id));
      const merged = [
        ...updatedFetched,
        ...state.items.filter(i => !existingIds.has(i.id))
      ];
      return { ...state, items: merged };
    }

    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };

    case 'UPDATE_ITEM_STATUS': {
      const { itemId, status } = action.payload;
      return {
        ...state,
        items: state.items.map(i => i.id === itemId ? { ...i, status } : i),
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };

    case 'TOGGLE_WAITLIST': {
      const currentWaitlist = state.user?.waitlist || [];
      const itemId = action.payload;
      const newWaitlist = currentWaitlist.includes(itemId)
        ? currentWaitlist.filter(id => id !== itemId)
        : [...currentWaitlist, itemId];
      return { ...state, user: { ...state.user, waitlist: newWaitlist } };
    }

    case 'START_NAVIGATION':
      return { ...state, activeItem: action.payload };

    case 'STOP_NAVIGATION':
      return { ...state, activeItem: null, activeRoute: null };

    case 'SET_ACTIVE_ROUTE':
      return { ...state, activeRoute: action.payload };

    case 'UPDATE_LOCATION':
      return { ...state, myLocation: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 20),
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    case 'APPROVE_ADMIN':
      if (state.user?.role === 'admin') {
        return { ...state, user: { ...state.user, approved: true } };
      }
      return state;

    case 'TOGGLE_VOICE':
      return { ...state, voiceEnabled: !state.voiceEnabled };

    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);

  // persist state to localStorage (debounced by React's batching)
  useEffect(() => {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
  }, [state]);

  // watch GPS position
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      pos => dispatch({ type: 'UPDATE_LOCATION', payload: [pos.coords.latitude, pos.coords.longitude] }),
      err => console.log('GPS initial error:', err.code),
      { enableHighAccuracy: true, timeout: 8000 }
    );

    const watcher = navigator.geolocation.watchPosition(
      pos => dispatch({ type: 'UPDATE_LOCATION', payload: [pos.coords.latitude, pos.coords.longitude] }),
      err => console.log('GPS watch error:', err.code),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Supabase session + data fetch
  useEffect(() => {
    let mounted = true;

    import('../supabaseClient').then(({ supabase }) => {
      // load existing session
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session && mounted) {
          // try to fetch the full profile row (incl. points, role, etc.)
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData = profile
            ? { ...profile, email: session.user.email }
            : { ...session.user.user_metadata, id: session.user.id, email: session.user.email };

          dispatch({ type: 'LOGIN', payload: userData });
        }
      });

      // listen for auth changes (login / logout)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session && mounted) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const userData = profile
            ? { ...profile, email: session.user.email }
            : { ...session.user.user_metadata, id: session.user.id, email: session.user.email };

          dispatch({ type: 'LOGIN', payload: userData });
        }
      });

      // fetch items from database
      supabase.from('items').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
        if (!error && data && data.length > 0 && mounted) {
          dispatch({ type: 'SET_ITEMS', payload: data });
        } else if (error) {
          console.warn('Could not load items from Supabase, using local demo data:', error.message);
        }
      });

      return () => { subscription?.unsubscribe(); };
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

// re-export school data so pages can import from here too  
export { PARKWAY_WEST, MISSOURI_SCHOOLS };
