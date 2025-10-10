import { useState, useEffect, useCallback, useMemo } from 'react';
import { DeliveryDetail } from '@/types/order-types';
import { getTravelDistance } from '@/api/order';
import { distanceCache } from '@/utils/distance-cache';

interface UseDeliveryFilterProps {
  data: DeliveryDetail[] | undefined;
  userLocation: { latitude: number; longitude: number } | null;
  locationPermission: boolean | null;
  searchQuery: string;
  maxDistance?: number;
}

export const useDeliveryFilter = ({
  data,
  userLocation,
  locationPermission,
  searchQuery,
  maxDistance = 200
}: UseDeliveryFilterProps) => {
  const [filteredData, setFilteredData] = useState<DeliveryDetail[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const getItemDistance = useCallback(async (pickupCoords: [number, number]) => {
    if (!userLocation) return null;
    
    const cachedDistance = distanceCache.get(
      userLocation.latitude,
      userLocation.longitude,
      pickupCoords[0],
      pickupCoords[1]
    );
    
    if (cachedDistance !== null) {
      return cachedDistance;
    }
    
    try {
      const distance = await getTravelDistance(
        userLocation.latitude,
        userLocation.longitude,
        pickupCoords[0],
        pickupCoords[1]
      );
      
      if (distance !== null) {
        distanceCache.set(
          userLocation.latitude,
          userLocation.longitude,
          pickupCoords[0],
          pickupCoords[1],
          distance
        );
      }
      
      return distance;
    } catch (error) {
      console.error('Error getting distance:', error);
      return null;
    }
  }, [userLocation]);

  const memoizedFilteredData = useMemo(() => {
    if (!searchQuery.trim()) return filteredData;
    
    const searchTerm = searchQuery.toLowerCase().trim();
    return filteredData.filter((item) => {
      const origin = item?.delivery?.origin?.toLowerCase() || "";
      const destination = item?.delivery?.destination?.toLowerCase() || "";
      return origin.includes(searchTerm) || destination.includes(searchTerm);
    });
  }, [filteredData, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    
    const filterDeliveries = async () => {
      if (!data || !locationPermission || !userLocation) {
        if (isMounted) {
          setFilteredData([]);
          setIsFiltering(false);
        }
        return;
      }

      setIsFiltering(true);

      try {
        const itemsWithinRange = await Promise.all(
          data.map(async (item) => {
            const pickupCoords = item.delivery?.pickup_coordinates;
            if (
              !pickupCoords ||
              pickupCoords[0] === null ||
              pickupCoords[1] === null ||
              typeof pickupCoords[0] !== "number" ||
              typeof pickupCoords[1] !== "number"
            ) return null;

            const distance = await getItemDistance([pickupCoords[0], pickupCoords[1]]);
            if (distance === null || distance > maxDistance) return null;
            
            return { ...item, distance };
          })
        );

        let filtered = itemsWithinRange.filter(Boolean) as (DeliveryDetail & { distance: number })[];
        filtered.sort((a, b) => a.distance - b.distance);

        if (isMounted) {
          setFilteredData(filtered);
          setIsFiltering(false);
        }
      } catch (error) {
        console.error('Error filtering deliveries:', error);
        if (isMounted) {
          setFilteredData([]);
          setIsFiltering(false);
        }
      }
    };

    filterDeliveries();
    
    return () => {
      isMounted = false;
    };
  }, [data, locationPermission, userLocation, getItemDistance, maxDistance]);

  return {
    filteredData: memoizedFilteredData,
    isFiltering,
    rawFilteredData: filteredData
  };
};
