import { supabase } from './supabase';
import { mapDbItemToAppItem } from '../utilities/itemMapper';

export async function fetchAllItems() {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapDbItemToAppItem);
}

export async function insertItem(dbItem, timeoutMs = 8000) {
  await Promise.race([
    supabase.from('items').insert([dbItem]),
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
  ]);
}
