export function mapDbItemToAppItem(item) {
  return {
    ...item,
    image: item.image_url || null,
    schoolId: item.schoolid || 'parkway-west',
    timestamp: item.timestamp ? Number(item.timestamp) : new Date(item.created_at).getTime(),
  };
}

export function mapAppItemToDbRow(localItem, imageUrl = null) {
  return {
    id: localItem.id,
    schoolid: 'parkway-west',
    type: localItem.type,
    title: localItem.title,
    category: localItem.category,
    location: localItem.location,
    location_name: localItem.location_name,
    coords: localItem.coords,
    description: localItem.description,
    reporter: localItem.reporter,
    reporter_id: localItem.reporter_id,
    status: localItem.status,
    timestamp: Date.now(),
    created_at: new Date().toISOString(),
    image_url: imageUrl,
  };
}
