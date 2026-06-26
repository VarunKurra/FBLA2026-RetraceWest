import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cubsscyukjdvbtmgxmpr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_NdfBuW7j0KTx1p-gsBPInw_72xV8hFl';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
