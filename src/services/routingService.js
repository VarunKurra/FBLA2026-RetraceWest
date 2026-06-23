const OSRM_BASE = 'https://router.project-osrm.org/route/v1';

export async function fetchWalkingRoute(fromCoords, toCoords, timeoutMs = 8000) {
  const [fromLat, fromLng] = fromCoords;
  const [toLat, toLng] = toCoords;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `${OSRM_BASE}/foot/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&steps=true&overview=full`,
      { signal: controller.signal }
    );

    const data = await response.json();
    if (data.routes?.length > 0) {
      return data.routes[0];
    }

    const drivingResponse = await fetch(
      `${OSRM_BASE}/driving/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&steps=true&overview=full`
    );
    const drivingData = await drivingResponse.json();

    if (drivingData.routes?.length > 0) {
      return drivingData.routes[0];
    }

    throw new Error('No route found');
  } finally {
    clearTimeout(timeout);
  }
}
