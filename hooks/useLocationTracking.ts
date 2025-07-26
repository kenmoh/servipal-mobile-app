import { useState, useEffect } from "react";
import * as Location from "expo-location";

const DISTANCE_THRESHOLD = 0.5; // 500 meters in kilometers

export const useLocationTracking = (
  onLocationChange: (location: { latitude: number; longitude: number }) => void
) => {
  const [subscription, setSubscription] =
    useState<Location.LocationSubscription | null>(null);
  const [lastLocation, setLastLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    let isMounted = true;

    const startLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 100,
        },
        (location) => {
          const newLocation = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };

          if (lastLocation) {
            const distance = calculateDistance(
              lastLocation.latitude,
              lastLocation.longitude,
              newLocation.latitude,
              newLocation.longitude
            );

            if (distance >= DISTANCE_THRESHOLD) {
              setLastLocation(newLocation);
              onLocationChange(newLocation);
            }
          } else {
            setLastLocation(newLocation);
            onLocationChange(newLocation);
          }
        }
      );

      if (isMounted) {
        setSubscription(subscription);
      }
    };

    startLocationTracking();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, [onLocationChange]);
};
