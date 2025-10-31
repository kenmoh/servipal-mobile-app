;
import HDivider from "@/components/HDivider";
import { LegendList } from '@legendapp/list';
import React, { useCallback, useEffect, useRef, useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import * as Location from "expo-location";

import { fetchRiders, getCurrentUserProfile, registerCoordinates, registerForNotifications, updateUserLocation } from "@/api/user";
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
import BottomSheet from '@gorhom/bottom-sheet';

import { assignRiderToExistingDelivery } from "@/api/order";
import AppTextInput from "@/components/AppInput";
import RiderProfile from "@/components/RiderProfile";
import { useToast } from "@/components/ToastProvider";
import { useOrderStore } from "@/store/orderStore";
import { router } from "expo-router";
import { Alert, View } from "react-native";
import * as Sentry from '@sentry/react-native';


const DeliveryScreen = () => {
  const { user, setProfile, setRiderId, riderId, isReassign } = useUserStore();
  const { deliveryId } = useOrderStore()
  const { expoPushToken } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRider, setSelectedRider] = useState<RiderProps | undefined>()
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLayoutComplete, setIsLayoutComplete] = useState(false);
  const { showError, showSuccess } = useToast()
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);



  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);


  const handleRiderPress = useCallback((rider: RiderProps) => {
    setSelectedRider(rider);
    bottomSheetRef.current?.snapToIndex(1)
    setRiderId(rider.rider_id)
  }, []);


  const reasignRiderMutation = useMutation({
    mutationFn: () => assignRiderToExistingDelivery(deliveryId as string, selectedRider?.rider_id!),
    onError: (error) => showError('Error', error.message || "An unexpcted error occured!"),
    onSuccess: () => showSuccess('Success', "New rider assigned")
  })


  const handleBookRider = useCallback(() => {

    if (isReassign && selectedRider) {

      Alert.alert('Assign Rider', 'Are you sure you want to re-assign to this rider?',
        [
          {
            text: "Cancel",
            style: "default",
          },
          {
            text: "Assign",
            onPress: () => {
              reasignRiderMutation.mutate()
              bottomSheetRef.current?.close()
            }
          },
        ]
      )
    }
    router.push({ pathname: '/(app)/delivery/sendItem', params: { riderId } })
    bottomSheetRef.current?.close()
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



  // const checkLocationPermission = useCallback(async () => {
  //   const { status } = await Location.getForegroundPermissionsAsync();
  //   const isLocationEnabled = await Location.hasServicesEnabledAsync();

  //   setLocationPermission(status === "granted" && isLocationEnabled);
  // }, []);

  const checkLocationPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    const isLocationEnabled = await Location.hasServicesEnabledAsync();
    setLocationPermission(status === "granted" && isLocationEnabled);
    return { status, isLocationEnabled };
  }, []);

  useEffect(() => {
  if (user) {
    Sentry.setUser({
      id: user.sub,
      email: user.email,
    });
    
    Sentry.setTag('user_type', user.user_type);
  }
}, [user]);

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


  const updateLocationMutation = useMutation({
    mutationFn: async (loc: { lat: number, lng: number }) => updateUserLocation(loc),
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
    let interval: any;

    const sendLocation = async () => {
      console.log('[Location] Starting location update attempt...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn('[Location] Permission denied.');
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({});
        updateLocationMutation.mutate({
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        }, {
          onSuccess: () => {
            console.log('[Location] Location sent to backend successfully. Refetching riders...');
            refetch();
          },
          onError: (err: any) => {
            console.error('[Location] Failed to send location to backend:', err);
          }
        });
      } catch (err) {
        console.error('[Location] Error getting location:', err);
      }
    };

    console.log('[Location] Starting user location polling interval.');
    sendLocation();
    interval = setInterval(sendLocation, 10 * 60 * 1000);

    return () => {
      console.log('[Location] Clearing user location polling interval.');
      clearInterval(interval);
    };
  }, [refetch]);


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

