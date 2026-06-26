import { supabase } from './supabase';

export const ADMIN_PASSCODES = ['ParkwayStaff', 'Parkway'];
export const BYPASS_STUDENT_EMAIL = 'kurrav9605@parkwayschools.net';
export const BYPASS_ADMIN_EMAIL = 'varunbkurra@gmail.com';
export const LOCAL_SESSION_KEY = 'retrace_local_user';

export function isValidAdminPasscode(code) {
  return ADMIN_PASSCODES.includes(code);
}

export function isBypassEmail(email) {
  const normalized = email.trim().toLowerCase();
  return normalized === BYPASS_STUDENT_EMAIL || normalized === BYPASS_ADMIN_EMAIL;
}

export function canBypassAuth(email, portalRole) {
  const normalized = email.trim().toLowerCase();
  if (normalized === BYPASS_ADMIN_EMAIL) return true;
  if (portalRole === 'admin') return normalized === BYPASS_ADMIN_EMAIL;
  return normalized === BYPASS_STUDENT_EMAIL;
}

export function resolvePortalRole(email, isAdminPortal) {
  const normalized = email.trim().toLowerCase();
  if (normalized === BYPASS_ADMIN_EMAIL) return 'admin';
  if (isAdminPortal) return 'admin';
  return 'student';
}

export function createBypassUser(email, role) {
  const normalized = email.trim().toLowerCase();
  const isAdmin = role === 'admin';

  return {
    id: `local-${normalized.replace(/[@.]/g, '-')}`,
    email: normalized,
    firstName: 'Varun',
    lastName: 'Kurra',
    schoolId: 'parkway-west',
    grade: isAdmin ? null : 10,
    role,
    points: 0,
    approved: true,
    status: 'active',
    isLocalSession: true,
  };
}

export function persistLocalSession(user) {
  try {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  } catch (error) {
    console.warn('Could not persist local session:', error.message);
  }
}

export function getLocalSessionUser() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLocalSession() {
  try {
    localStorage.removeItem(LOCAL_SESSION_KEY);
  } catch {
    // ignore
  }
}

function withTimeout(promise, timeoutMs, label = 'Request') {
  if (!timeoutMs) return promise;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${label} timed out`)), timeoutMs);
    }),
  ]);
}

export function applyPortalRole(user, portalRole) {
  if (portalRole === 'admin') {
    user.role = 'admin';
    user.approved = true;
  }
  return user;
}

function ensureEmailRole(user) {
  if (user.email?.toLowerCase() === BYPASS_ADMIN_EMAIL) {
    user.role = 'admin';
    user.approved = true;
  }
  return user;
}

export function mapProfileToUser(profile, authUser) {
  const metadata = authUser?.user_metadata || {};

  return {
    id: profile?.id || authUser.id,
    email: authUser.email,
    firstName: profile?.first_name || metadata.first_name || 'Student',
    lastName: profile?.last_name || metadata.last_name || '',
    schoolId: profile?.school_id || metadata.school_id || 'parkway-west',
    grade: profile?.grade ?? metadata.grade ?? null,
    role: profile?.role || metadata.role || 'student',
    points: profile?.points ?? 0,
    approved: profile?.approved ?? (metadata.role !== 'admin'),
    status: profile?.status || 'active',
  };
}

async function fetchProfile(userId) {
  try {
    const result = await withTimeout(
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      4000,
      'Profile fetch'
    );

    const { data, error } = result;

    if (error) {
      if (error.code !== 'PGRST205') {
        console.warn('Profile fetch warning:', error.message);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Profile fetch skipped:', error.message);
    return null;
  }
}

async function buildUserFromSession(session) {
  const profile = await fetchProfile(session.user.id);
  return ensureEmailRole(mapProfileToUser(profile, session.user));
}

export async function getUserFromAuthUser(authUser, portalRole = 'student') {
  const profile = await fetchProfile(authUser.id);
  const user = mapProfileToUser(profile, authUser);
  if (!profile?.role && !authUser?.user_metadata?.role) {
    user.role = portalRole;
  }
  return ensureEmailRole(applyPortalRole(user, portalRole));
}

export async function upsertProfile(userId, profileData) {
  try {
    const { error } = await withTimeout(
      supabase.from('profiles').upsert({ id: userId, ...profileData }),
      4000,
      'Profile sync'
    );

    if (error && error.code !== 'PGRST205') {
      console.warn('Profile sync warning:', error.message);
    }
  } catch (error) {
    console.warn('Profile sync skipped:', error.message);
  }
}

export async function signUpWithEmail({
  email,
  password,
  firstName,
  lastName,
  grade,
  role,
}) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await withTimeout(
    supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          grade: grade ?? null,
          school_id: 'parkway-west',
          role,
        },
      },
    }),
    8000,
    'Sign up'
  );

  if (error) throw error;

  if (data.user) {
    await upsertProfile(data.user.id, {
      email: normalizedEmail,
      first_name: firstName,
      last_name: lastName,
      grade: grade ?? null,
      school_id: 'parkway-west',
      role,
      points: 0,
      status: 'active',
    });
  }

  return data;
}

export async function signInWithEmail(email, password, { timeoutMs = 8000 } = {}) {
  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    }),
    timeoutMs,
    'Sign in'
  );

  if (error) throw error;
  return data;
}

export async function getCurrentSessionUser() {
  try {
    const { data: { session } } = await withTimeout(
      supabase.auth.getSession(),
      4000,
      'Session check'
    );

    if (session) {
      clearLocalSession();
      return buildUserFromSession(session);
    }
  } catch (error) {
    console.warn('Session restore skipped:', error.message);
  }

  return getLocalSessionUser();
}

export function subscribeToAuthChanges(onUserChange) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) return;

    try {
      clearLocalSession();
      const user = await buildUserFromSession(session);
      onUserChange(user);
    } catch (error) {
      console.warn('Auth state change skipped:', error.message);
    }
  });

  return subscription;
}

export async function signOutUser() {
  clearLocalSession();
  return supabase.auth.signOut();
}
