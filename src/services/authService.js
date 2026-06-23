import { supabase } from './supabase';

async function buildUserFromSession(session) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (profile) {
    return { ...profile, email: session.user.email };
  }

  return {
    ...session.user.user_metadata,
    id: session.user.id,
    email: session.user.email,
  };
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
