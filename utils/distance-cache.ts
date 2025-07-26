interface CacheEntry {
  distance: number;
  timestamp: number;
}

class DistanceCache {
  private cache: Map<string, CacheEntry>;
  private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  constructor() {
    this.cache = new Map();
  }

  private generateKey(
    userLat: number,
    userLng: number,
    itemLat: number,
    itemLng: number
  ): string {
    return `${userLat},${userLng}-${itemLat},${itemLng}`;
  }

  set(
    userLat: number,
    userLng: number,
    itemLat: number,
    itemLng: number,
    distance: number
  ) {
    const key = this.generateKey(userLat, userLng, itemLat, itemLng);
    this.cache.set(key, {
      distance,
      timestamp: Date.now(),
    });
  }

  get(
    userLat: number,
    userLng: number,
    itemLat: number,
    itemLng: number
  ): number | null {
    const key = this.generateKey(userLat, userLng, itemLat, itemLng);
    const entry = this.cache.get(key);

    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }

    return entry.distance;
  }

  clear() {
    this.cache.clear();
  }
}

export const distanceCache = new DistanceCache();
