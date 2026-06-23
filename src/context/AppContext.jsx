import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { PARKWAY_WEST, MISSOURI_SCHOOLS } from '../data/missouriSchools';
import { EXAMPLE_ITEMS } from '../data/exampleItems';
import { fetchAllItems } from '../services/itemService';
import { getCurrentSessionUser, subscribeToAuthChanges, signOutUser } from '../services/authService';

const AppContext = createContext();

const PERSIST_KEY = 'trackback_pw_v5_state';

const getInitialState = () => {
  const defaultState = {
    user: null,
    myLocation: PARKWAY_WEST.coords,
    items: EXAMPLE_ITEMS,
    activeItem: null,
    activeRoute: null,
    mapView: null,
    voiceEnabled: true,
    captchaSolved: false,
    notifications: [],
  };

  const stored = localStorage.getItem(PERSIST_KEY);
  if (!stored) return defaultState;

  try {
    const parsed = JSON.parse(stored);

    // Only keep demo items from cache. Old offline reports (it-*) get dropped on reload.
    const cachedItems = (parsed.items || []).filter(item => item.id.startsWith('ex-'));
    const existingIds = new Set(cachedItems.map(item => item.id));
    const mergedItems = [
      ...cachedItems,
      ...defaultState.items.filter(item => !existingIds.has(item.id)),
    ];

    return {
      ...defaultState,
      ...parsed,
      items: mergedItems,
      myLocation: defaultState.myLocation,
      captchaSolved: false,
      activeRoute: null,
      activeItem: null,
      mapView: null,
    };
  } catch (error) {
    console.warn('Failed to parse stored state, starting fresh', error.message);
    return defaultState;
  }
};

// Data abstraction: all app state flows through one reducer so updates stay predictable.
function appReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload };

    case 'LOGOUT':
      signOutUser();
      return { ...state, user: null, activeItem: null, notifications: [] };

    case 'UPDATE_USER_POINTS':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, points: action.payload } };

    case 'SET_ITEMS': {
      const fetched = action.payload || [];

      // Keep demo pins aligned with our campus layout even after a remote sync.
      const normalized = fetched.map(item => {
        const localMatch = EXAMPLE_ITEMS.find(
          example => example.id === item.id || example.title === item.title
        );

        if (localMatch) {
          return { ...item, coords: localMatch.coords };
        }

        if (item.coords?.length === 2 && item.coords[1] > -90.5360) {
          return { ...item, coords: [item.coords[0] - 0.0015, item.coords[1] - 0.0035] };
        }

        return item;
      });

      const existingIds = new Set(normalized.map(item => item.id));
      const merged = [
        ...normalized,
        ...state.items.filter(item => !existingIds.has(item.id)),
      ];

      return { ...state, items: merged };
    }

    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };

    case 'UPDATE_ITEM_STATUS': {
      const { itemId, status } = action.payload;
      return {
        ...state,
        items: state.items.map(item => (
          item.id === itemId ? { ...item, status } : item
        )),
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload) };

    case 'CLAIM_ITEM': {
      const itemId = action.payload;
      return {
        ...state,
        items: state.items.map(item => (
          item.id === itemId ? { ...item, status: 'claimed' } : item
        )),
        activeItem: null,
        activeRoute: null,
      };
    }

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

    case 'SET_MAP_VIEW':
      return { ...state, mapView: action.payload };

    case 'CLEAR_MAP_VIEW':
      return { ...state, mapView: null };

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

  // Saves state to localStorage so the app keeps working after a refresh.
  useEffect(() => {
    localStorage.setItem(PERSIST_KEY, JSON.stringify(state));
  }, [state]);

  // Geolocation: track the user's position for distance sorting and walking directions.
  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      position => dispatch({
        type: 'UPDATE_LOCATION',
        payload: [position.coords.latitude, position.coords.longitude],
      }),
      error => console.log('GPS initial error:', error.code),
      { enableHighAccuracy: true, timeout: 8000 }
    );

    const watcher = navigator.geolocation.watchPosition(
      position => dispatch({
        type: 'UPDATE_LOCATION',
        payload: [position.coords.latitude, position.coords.longitude],
      }),
      error => console.log('GPS watch error:', error.code),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  // Database sync: load the user session and item list from Supabase on startup.
  useEffect(() => {
    let mounted = true;

    getCurrentSessionUser()
      .then(user => {
        if (user && mounted) {
          dispatch({ type: 'LOGIN', payload: user });
        }
      })
      .catch(error => {
        console.warn('Session restore skipped:', error.message);
      });

    const subscription = subscribeToAuthChanges(user => {
      if (mounted) {
        dispatch({ type: 'LOGIN', payload: user });
      }
    });

    fetchAllItems()
      .then(items => {
        if (items.length > 0 && mounted) {
          dispatch({ type: 'SET_ITEMS', payload: items });
        }
      })
      .catch(error => {
        console.warn('Could not load items from Supabase, using local demo data:', error.message);
      });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

// eslint-disable-next-line react-refresh/only-export-components
export { PARKWAY_WEST, MISSOURI_SCHOOLS };
