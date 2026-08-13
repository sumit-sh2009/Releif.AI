/** Deterministic pseudo-coordinates from an entity id (stable across re-renders). */
export function hashToCoords(
  id: string,
  centerLat: number,
  centerLng: number,
  spread = 0.04,
): [number, number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  }
  const latNorm = ((hash & 0xffff) / 0xffff - 0.5) * spread;
  const lngNorm = (((hash >> 16) & 0xffff) / 0xffff - 0.5) * spread;
  return [centerLat + latNorm, centerLng + lngNorm];
}

export function resolveCoords(
  id: string,
  lat: number | null | undefined,
  lng: number | null | undefined,
  fallbackCenter: [number, number],
): [number, number] {
  if (lat != null && lng != null) return [lat, lng];
  return hashToCoords(id, fallbackCenter[0], fallbackCenter[1]);
}
