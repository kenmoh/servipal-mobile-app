interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodingCache {
  [address: string]: {
    coordinates: Coordinates;
    timestamp: number;
  };
}

const geocodingCache: GeocodingCache = {};
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export const getCoordinatesFromAddress = async (
  address: string
): Promise<Coordinates | null> => {
  // Check cache first
  const cached = geocodingCache[address];
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.coordinates;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`
    );
    const data = await response.json();

    if (data.results?.[0]?.geometry?.location) {
      const coordinates = data.results[0].geometry.location;

      // Cache the result
      geocodingCache[address] = {
        coordinates,
        timestamp: Date.now(),
      };

      return coordinates;
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};
