const EARTH_RADIUS_MI = 3958.8;

export function haversineDistanceMiles(fromCoords, toCoords) {
  if (!fromCoords || !toCoords) return 999;

  const [fromLat, fromLng] = fromCoords;
  const [toLat, toLng] = toCoords;
  const latDelta = (toLat - fromLat) * Math.PI / 180;
  const lngDelta = (toLng - fromLng) * Math.PI / 180;

  const a = Math.sin(latDelta / 2) ** 2
    + Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180)
    * Math.sin(lngDelta / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MI * c;
}

export function formatItemDistance(fromCoords, toCoords) {
  const miles = haversineDistanceMiles(fromCoords, toCoords);
  if (miles > 100) return 'Unknown';
  if (miles < 0.1) return `${(miles * 5280).toFixed(0)} FT`;
  return `${miles.toFixed(2)} MI`;
}

export function formatDistanceFeet(feetValue) {
  const feet = Number(feetValue);
  if (Number.isNaN(feet)) return '—';
  if (feet >= 5280) return `${(feet / 5280).toFixed(1)} mi`;
  return `${Math.round(feet)} ft`;
}

export function formatDuration(seconds) {
  if (Number.isNaN(seconds) || seconds < 0) return '—';
  if (seconds < 60) return '< 1 min';

  const minutes = Math.ceil(seconds / 60);
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours} hr ${remainingMinutes} min` : `${hours} hr`;
  }

  return `${minutes} min`;
}
