import { supabase } from './supabase';

export async function uploadItemImage(dataUrl) {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const fileName = `item_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;

  const { data, error } = await supabase.storage
    .from('item-images')
    .upload(fileName, blob, { contentType: 'image/jpeg' });

  if (error || !data) {
    throw error || new Error('Upload failed');
  }

  const { data: { publicUrl } } = supabase.storage
    .from('item-images')
    .getPublicUrl(data.path);

  return publicUrl;
}
