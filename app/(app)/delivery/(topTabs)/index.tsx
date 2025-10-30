;
import HDivider from "@/components/HDivider";
import { LegendList } from '@legendapp/list';
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import * as Location from "expo-location";

import { fetchRiders, getCurrentUserProfile, registerCoordinates, registerForNotifications } from "@/api/user";
import { DeliveryListSkeleton, SearchBarSkeleton } from "@/components/LoadingSkeleton";
import LocationPermission from "@/components/Locationpermission";
import { useNotification } from "@/components/NotificationProvider";
import RefreshButton from "@/components/RefreshButton";
import Rider from "@/components/Rider";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import authStorage from "@/storage/authStorage";
import { useUserStore } from "@/store/userStore";
import { RiderProps, UserCoords, UserDetails } from "@/types/user-types";
import { distanceCache } from "@/utils/distance-cache";
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';

import AppTextInput from "@/components/AppInput";
import RiderProfile from "@/components/RiderProfile";
import { router } from "expo-router";
import { useColorScheme, View } from "react-native";


const DeliveryScreen = () => {
  const { user, setProfile, setRiderId, riderId } = useUserStore();
  const { expoPushToken } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRider, setSelectedRider] = useState<RiderProps | undefined>()
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLayoutComplete, setIsLayoutComplete] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const theme = useColorScheme()

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);


  const handleRiderPress = useCallback((rider: RiderProps) => {
    setSelectedRider(rider);
    bottomSheetRef.current?.snapToIndex(1)
    setRiderId(rider.rider_id)
  }, []);


  const handleBookRider = useCallback(() => {
    router.push({ pathname: '/(app)/delivery/sendItem', params: { riderId } })
  }, []);



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
    retry: 3,
  });

  const registerCoordinatesMutation = useMutation({
    mutationFn: registerCoordinates,
    onError: (error) => {
      console.error("📍 Coordinates registration failed:", error);
    },
    retry: 3,
  });


  const { data: userProfile, isSuccess } = useQuery({
    queryKey: ["profile", user?.sub],
    queryFn: () => getCurrentUserProfile(user?.sub as string),
    refetchOnWindowFocus: true,
    enabled: !!user?.sub,
  });

  const coords: UserCoords = {
    user_id: user?.sub,
    lat: userLocation?.latitude!,
    lng: userLocation?.longitude!,
  };


  const { data: riders, isLoading, error, refetch, isFetching, isPending, isFetched } = useQuery({
    queryKey: ["riders", user?.sub, coords.lat, coords.lng],
    queryFn: () => {
      // Validate coords before fetching
      if (!coords.lat || !coords.lng) {
        throw new Error("Location coordinates are not available");
      }
      return fetchRiders(coords.lat, coords.lng);
    },
    enabled: Boolean(user?.sub && coords.lat && coords.lng),
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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


  // Handle location change
  const handleLocationChange = useCallback(
    (newLocation: { latitude: number; longitude: number }) => {
      setUserLocation(newLocation);
      distanceCache.clear();
    },
    []
  );


  useLocationTracking(handleLocationChange);


  const renderItem = useCallback(({ item }: { item: RiderProps }) => <Rider onPress={() => handleRiderPress(item)} rider={item} />, [handleRiderPress]);

  const renderSeparator = useCallback(() => <HDivider />, []);

  const keyExtractor = useCallback(
    (item: RiderProps, index: number) =>
      item.rider_id ?? `rider-${index}`,
    []
  );



  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);



  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);


  if (!locationPermission) {
    return <LocationPermission onRetry={checkLocationPermission} />;
  }

  if (isLoading || isFetching || isPending || !isFetched || !riders) {
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

      <LegendList
        data={riders || []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        refreshing={isFetching}
        onRefresh={handleRefresh}
        onLayout={handleLayoutComplete}

      />

      {selectedRider && <RiderProfile ref={bottomSheetRef} riderData={selectedRider} showButton onPress={handleBookRider} />}

    </View>
  );


};

export default DeliveryScreen;

