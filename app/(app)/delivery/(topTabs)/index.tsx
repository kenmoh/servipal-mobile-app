import { fetchPaidPendingDeliveries, getTravelDistance } from "@/api/order";
import HDivider from "@/components/HDivider";
import ItemCard from "@/components/ItemCard";
import { LegendList } from '@legendapp/list';
import React from "react";

import { DeliveryDetail } from "@/types/order-types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import * as Location from "expo-location";

import { getCurrentUserProfile, registerCoordinates, registerForNotifications } from "@/api/user";
import AppTextInput from "@/components/AppInput";
import FAB from "@/components/FAB";
import { DeliveryListSkeleton, SearchBarSkeleton } from "@/components/LoadingSkeleton";
import LocationPermission from "@/components/Locationpermission";
import { useNotification } from "@/components/NotificationProvider";
import RefreshButton from "@/components/RefreshButton";
import { useAuth } from "@/context/authContext";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import authStorage from "@/storage/authStorage";
import { UserDetails } from "@/types/user-types";
import { distanceCache } from "@/utils/distance-cache";
import { router } from "expo-router";
import { View } from "react-native";

const DeliveryScreen = () => {
  const { user, setProfile } = useAuth();
  const { expoPushToken } = useNotification()
  const [searchQuery, setSearchQuery] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(
    null
  );
  const [isLayoutComplte, setIsLayoutComplete] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const handleLayoutComplete = () => {
    if (!isLayoutComplte) {
      setIsLayoutComplete(true);

    }
  };

  const storeUserProfile = async (profile: UserDetails) => {
    await authStorage.removeProfile()
    await authStorage.storeProfile(profile)
  }

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
  });

  const registerCoordinatesMutation = useMutation({
    mutationFn: registerCoordinates,
    onError: (error) => console.log(error)

  });


  const { data: userProfile, isSuccess } = useQuery({
    queryKey: ["profile", user?.sub],
    queryFn: () => getCurrentUserProfile(user?.sub as string),
    refetchOnWindowFocus: true,
    enabled: !!user?.sub,
  });


console.log(expoPushToken, userLocation)

  useEffect(() => {
    if (expoPushToken && userLocation) {
      // Send the token to server when it exists
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
    queryFn: () => fetchPaidPendingDeliveries(),
    refetchOnWindowFocus: true,
    refetchOnMount: true,

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


  const renderItem = useCallback(({ item }: { item: DeliveryDetail }) => <ItemCard data={item} />, []);

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

  // Filter deliveries within 30km
  const [filteredData, setFilteredData] = useState<DeliveryDetail[]>([]);

  useEffect(() => {
    let isMounted = true;
    const filterDeliveries = async () => {
      if (!data || !locationPermission || !userLocation) {
        if (isMounted) setFilteredData([]);
        return;
      }
      const itemsWithinRange = await Promise.all(
        data.map(async (item) => {
          const pickupCoords = item.delivery?.pickup_coordinates;
          if (
            !pickupCoords ||
            pickupCoords[0] === null ||
            pickupCoords[1] === null ||
            typeof pickupCoords[0] !== "number" ||
            typeof pickupCoords[1] !== "number"
          )
            return null;
          const distance = await getItemDistance([
            pickupCoords[0],
            pickupCoords[1],
          ]);
          if (distance === null || distance > 100) return null;
          return {
            ...item,
            distance,
          };
        })
      );
      let filtered = itemsWithinRange.filter(Boolean) as (DeliveryDetail & {
        distance: number;
      })[];
      // Sort by distance (closest first)
      filtered.sort((a, b) => a.distance - b.distance);
      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((item) => {
          const origin = item?.delivery?.origin?.toLowerCase() || "";
          const destination = item?.delivery?.destination?.toLowerCase() || "";
          return (
            origin.includes(searchTerm) || destination.includes(searchTerm)
          );
        });
      }
      // Only update state if changed
      setFilteredData((prev) => {
        const prevIds = prev.map((i) => (i.delivery?.id ?? '') + (typeof (i as any).distance !== 'undefined' ? (i as any).distance : ''));
        const nextIds = filtered.map((i) => (i.delivery?.id ?? '') + (typeof (i as any).distance !== 'undefined' ? (i as any).distance : ''));
        if (
          prev.length === filtered.length &&
          prevIds.every((id, idx) => id === nextIds[idx])
        ) {
          return prev;
        }
        return filtered;
      });
    };
    filterDeliveries();
    return () => {
      isMounted = false;
    };
  }, [data, searchQuery, locationPermission, userLocation, getItemDistance]);

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

  console.log(data)

  return (
    <View className="bg-background flex-1 p-2">
      <AppTextInput
        borderRadius={50}
        placeholder="Search"
        onChangeText={handleSearch}
        value={searchQuery}
      />
      <HDivider />

      <LegendList
        data={data || []}
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
