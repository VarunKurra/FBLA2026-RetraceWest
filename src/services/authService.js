import { supabase } from './supabase';

export const ADMIN_PASSCODES = ['ParkwayStaff', 'Parkway'];
export const BYPASS_STUDENT_EMAIL = 'kurrav9605@parkwayschools.net';
export const BYPASS_ADMIN_EMAIL = 'varunbkurra@gmail.com';

export function isValidAdminPasscode(code) {
  return ADMIN_PASSCODES.includes(code);
}

export function canBypassAuth(email, portalRole) {
  const normalized = email.trim().toLowerCase();
  if (portalRole === 'admin') return normalized === BYPASS_ADMIN_EMAIL;
  return normalized === BYPASS_STUDENT_EMAIL;
}

export function createBypassUser(email, role) {
  const normalized = email.trim().toLowerCase();
  const isAdmin = role === 'admin';

  return {
    id: `local-${normalized.replace(/[@.]/g, '-')}`,
    email: normalized,
    firstName: isAdmin ? 'Varun' : 'Varun',
    lastName: isAdmin ? 'Kurra' : 'Kurra',
    schoolId: 'parkway-west',
    grade: isAdmin ? null : 10,
    role,
    points: 0,
    approved: true,
    status: 'active',
  };
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    // profiles table may not exist yet on a fresh Supabase project
    if (error.code !== 'PGRST205') {
      console.warn('Profile fetch warning:', error.message);
    }
    return null;
  }

  return data;
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
  const { error } = await supabase.from('profiles').upsert({
    id: userId,
    ...profileData,
  });

  if (error && error.code !== 'PGRST205') {
    console.warn('Profile sync warning:', error.message);
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

  const { data, error } = await supabase.auth.signUp({
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
  });

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

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function getCurrentSessionUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return buildUserFromSession(session);
}

export function subscribeToAuthChanges(onUserChange) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session) return;
    const user = await buildUserFromSession(session);
    onUserChange(user);
  });

  return subscription;
}

export function signOutUser() {
  return supabase.auth.signOut();
}
