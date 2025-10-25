import { fetchPaidPendingDeliveries, getTravelDistance } from "@/api/order";
import HDivider from "@/components/HDivider";
import { LegendList } from '@legendapp/list';
import React, { useCallback, useEffect, useState, useMemo, useRef } from "react";

import { DeliveryDetail } from "@/types/order-types";
import { useMutation, useQuery } from "@tanstack/react-query";

import * as Location from "expo-location";

import { getCurrentUserProfile, registerCoordinates, registerForNotifications } from "@/api/user";
import AppTextInput from "@/components/AppInput";
import FAB from "@/components/FAB";
import { DeliveryListSkeleton, SearchBarSkeleton } from "@/components/LoadingSkeleton";
import LocationPermission from "@/components/Locationpermission";
import { useNotification } from "@/components/NotificationProvider";
import RefreshButton from "@/components/RefreshButton";
import GradientCard from '@/components/GradientCard';
import DeliveryCard from "@/components/DeliveryCard";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import authStorage from "@/storage/authStorage";
import { useUserStore } from "@/store/userStore";
import { UserDetails } from "@/types/user-types";
import { distanceCache } from "@/utils/distance-cache";
import { router } from "expo-router";
import { View , Button} from "react-native";


const DeliveryScreen = () => {
  const { user, setProfile } = useUserStore();
  const { expoPushToken } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLayoutComplete, setIsLayoutComplete] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [filteredData, setFilteredData] = useState<DeliveryDetail[]>([]);

  const debounceTimer = useRef<NodeJS.Timeout>();

  // Debounce search query
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]);

  const handleLayoutComplete = useCallback(() => {
    setIsLayoutComplete(true);
  }, []);

  const storeUserProfile = useCallback(async (profile: UserDetails) => {
    try {
      await authStorage.removeProfile();
      await authStorage.storeProfile(profile);
    } catch (error) {
      console.error('Error storing profile:', error);
    }
  }, []);

  const checkLocationPermission = useCallback(async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    const isLocationEnabled = await Location.hasServicesEnabledAsync();

    setLocationPermission(status === "granted" && isLocationEnabled);
  }, []);

  useEffect(() => {
    const getUserLocation = async () => {
      if (!locationPermission) return;

      try {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting user location:", error);
      }
    };

    getUserLocation();
  }, [locationPermission]);

  useEffect(() => {
    checkLocationPermission();
  }, [checkLocationPermission]);




  const registerMutation = useMutation({
    mutationFn: registerForNotifications,
    onSuccess: (data) => {
      console.log("🔔 Token registered successfully:", data);
    },
    onError: (error) => {
      console.error("🔔 Token registration failed:", error);
    },
    retry: 2,
  });

  const registerCoordinatesMutation = useMutation({
    mutationFn: registerCoordinates,
    onError: (error) => {
      console.error("📍 Coordinates registration failed:", error);
    },
    retry: 1,
  });


  const { data: userProfile, isSuccess } = useQuery({
    queryKey: ["profile", user?.sub],
    queryFn: () => getCurrentUserProfile(user?.sub as string),
    refetchOnWindowFocus: true,
    enabled: !!user?.sub,
  });



  useEffect(() => {
    if (expoPushToken && userLocation) {
      registerMutation.mutate({
        notification_token: expoPushToken!,
      });

      registerCoordinatesMutation.mutate({

        lat: userLocation?.latitude!,
        lng: userLocation?.longitude!

      })
    }
  }, [expoPushToken, userLocation]);





  useEffect(() => {
    if (isSuccess && userProfile) {
      // Update state with fresh API data
      setProfile(userProfile);

      // Store the fresh data for offline use
      storeUserProfile(userProfile);
    }
  }, [isSuccess, userProfile, user?.sub]);


  const { data, isLoading, error, refetch, isFetching, isPending, isFetched } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchPaidPendingDeliveries,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  // Handle location change
  const handleLocationChange = useCallback(
    (newLocation: { latitude: number; longitude: number }) => {
      setUserLocation(newLocation);
      distanceCache.clear();
    },
    []
  );


  useLocationTracking(handleLocationChange);

  // Memoize getItemDistance
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
  }, [userLocation]);


  const renderItem = useCallback(({ item }: { item: DeliveryDetail }) => <DeliveryCard data={item} />, []);

  const renderSeparator = useCallback(() => <HDivider />, []);

  const keyExtractor = useCallback(
    (item: DeliveryDetail, index: number) =>
      item?.delivery?.id ?? `delivery-${index}`,
    []
  );

  const handleSendItemPress = useCallback(() => {
    router.push("/delivery/sendItem");
  }, []);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);



  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  // Memoize filtered data to prevent unnecessary re-computations
  const memoizedFilteredData = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return filteredData;
    const searchTerm = debouncedSearchQuery.toLowerCase().trim();
    return filteredData.filter((item) => {
      const origin = item?.delivery?.origin?.toLowerCase() || "";
      const destination = item?.delivery?.destination?.toLowerCase() || "";
      return origin.includes(searchTerm) || destination.includes(searchTerm);
    });
  }, [filteredData, debouncedSearchQuery]);

  // Filter deliveries within 30km with optimized logic
  useEffect(() => {
    let isMounted = true;
    
    const filterDeliveries = async () => {
      if (!data || !locationPermission || !userLocation) {
        if (isMounted) setFilteredData([]);
        return;
      }

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
            if (distance === null || distance > 200) return null;
            
            return { ...item, distance };
          })
        );

        let filtered = itemsWithinRange.filter(Boolean) as (DeliveryDetail & { distance: number })[];
        filtered.sort((a, b) => a.distance - b.distance);

        if (isMounted) {
          setFilteredData((prev) => {
            const prevIds = prev.map((i) => `${i.delivery?.id}-${(i as any).distance || 0}`);
            const nextIds = filtered.map((i) => `${i.delivery?.id}-${i.distance}`);
            
            if (prev.length === filtered.length && prevIds.every((id, idx) => id === nextIds[idx])) {
              return prev;
            }
            return filtered;
          });
        }
      } catch (error) {
        console.error('Error filtering deliveries:', error);
        if (isMounted) setFilteredData([]);
      }
    };

    filterDeliveries();
    
    return () => {
      isMounted = false;
    };
  }, [data, locationPermission, userLocation, getItemDistance]);

  if (!locationPermission) {
    return <LocationPermission onRetry={checkLocationPermission} />;
  }

  if (isLoading || isFetching || isPending || !isFetched || !data) {
    return (
      <View className="bg-background flex-1 p-2" >
        <SearchBarSkeleton />
        <HDivider />
        <DeliveryListSkeleton />
      </View>
    );
  }

  if (error) return <RefreshButton onPress={refetch} label="Error loading delivery items" />



  return (
    <View className="bg-background flex-1 p-2">
      <AppTextInput
        borderRadius={50}
        placeholder="Search"
        onChangeText={handleSearch}
        value={searchQuery}
      />
      <HDivider />
      {memoizedFilteredData.length === 0 && <GradientCard label="Quick & Reliable Delivery" description="Send and receive items with ease, anywhere, anytime."/>}


    <LegendList
        data={memoizedFilteredData || []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        refreshing={isFetching}
        onRefresh={handleRefresh}
        onLayout={handleLayoutComplete}
       
      />

      {user?.user_type === 'dispatch' || user?.user_type === 'rider' ? '' : <FAB onPress={handleSendItemPress} />}

    </View>
  );
};

export default DeliveryScreen;
