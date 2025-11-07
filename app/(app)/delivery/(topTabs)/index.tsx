

import HDivider from "@/components/HDivider";
// import { LegendList } from '@legendapp/list';
import React, { useCallback, useEffect, useRef, useState } from "react";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as Location from "expo-location";

import { fetchRiders, getCurrentUserProfile, registerCoordinates, registerForNotifications, updateUserLocation } from "@/api/user";
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
import AppVariantButton from "@/components/core/AppVariantButton";
import LoadingIndicator from '@/components/LoadingIndicator';
import NewRidersBanner from '@/components/NewRidersBanner';
import { useToast } from "@/components/ToastProvider";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useOrderStore } from "@/store/orderStore";
import { useRiderStore } from '@/store/rider-store';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import * as Sentry from '@sentry/react-native';
import { router } from "expo-router";
import { Building, MapPin } from "lucide-react-native";
import { Alert, FlatList, Image, Text, useColorScheme, View } from "react-native";


const DeliveryScreen = () => {
  const { user, setProfile, setRiderId, riderId, isReassign, setisReassign } = useUserStore();
  const { deliveryId } = useOrderStore()
  const { expoPushToken } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRider, setSelectedRider] = useState<RiderProps | undefined>()
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null);
  const [isLayoutComplete, setIsLayoutComplete] = useState(false);
  const { showError, showSuccess } = useToast()

  const theme = useColorScheme()

  const HANDLE_INDICATOR_STYLE = theme === 'dark' ? HEADER_BG_LIGHT : HEADER_BG_DARK
  const HANDLE_STYLE = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
  const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT




  const queryClient = useQueryClient();
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);



  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const listRef = useRef<FlatList>(null);
  const ITEM_HEIGHT = 138;

  const getItemLayout = useCallback(
    (data: any, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );


  const handleRiderPress = useCallback((rider: RiderProps) => {
    setSelectedRider(rider);
    setRiderId(rider.rider_id);
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(0);
    });
  }, [setRiderId]);


  const reasignRiderMutation = useMutation({
    mutationFn: () => assignRiderToExistingDelivery(deliveryId as string, selectedRider?.rider_id!),
    onError: (error) => {
      showError('Error', error.message || "An unexpcted error occured!")
      setisReassign(false)
      refetch()
      setRiderId('')
    },
    onSuccess: async () => {
      showSuccess('Success', "New rider assigned")
      setisReassign(false)
      setRiderId('')
      refetch()
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
      });
    }
  })

  const handleScrollToHide = useCallback(() => {
    const { newRiderCount, clearNewRiders } = useRiderStore.getState();
    if (newRiderCount > 0) {
      clearNewRiders();
    }
  }, []);

  const handleBookRider = useCallback(() => {

    if (isReassign && selectedRider && riderId) {

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
    } else {
      router.push({ pathname: '/(app)/delivery/sendItem', params: { riderId } })
      bottomSheetRef.current?.close()
    }

  }, [isReassign, selectedRider, riderId]);



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
    try {
      // 1. Check if already granted (FAST + NO POPUP)
      const { status } = await Location.getForegroundPermissionsAsync();
      const isLocationEnabled = await Location.hasServicesEnabledAsync();

      if (status === "granted" && isLocationEnabled) {
        setLocationPermission(true);
        return { status, isLocationEnabled };
      }

      // 2. Only request if not granted
      if (status !== "granted") {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        const finalEnabled = await Location.hasServicesEnabledAsync();
        setLocationPermission(newStatus === "granted" && finalEnabled);
        return { status: newStatus, isLocationEnabled: finalEnabled };
      }

      // 3. Denied or disabled
      setLocationPermission(false);
      return { status, isLocationEnabled };
    } catch (error) {
      console.error("Permission check failed:", error);
      setLocationPermission(false);
      return { status: "undetermined", isLocationEnabled: false };
    }
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


  const { data: riders, isLoading, error, refetch, isFetching, isPlaceholderData } = useQuery({
    queryKey: ["riders", user?.sub, coords.lat, coords.lng],
    queryFn: () => fetchRiders(coords.lat!, coords.lng!),
    enabled: Boolean(user?.sub && coords.lat && coords.lng),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,

    onSuccess: (newRiders: RiderProps[]) => {
      const { previousRiders, setPreviousRiders, setNewRiderCount } = useRiderStore.getState();

      if (newRiders && previousRiders.length > 0) {
        // Compare: new riders not in old list (use rider_id)
        const oldIds = new Set(previousRiders.map(r => r.rider_id));
        const newOnes = newRiders.filter((r: RiderProps) => !oldIds.has(r.rider_id));
        const count = newOnes.length;

        if (count > 0) {
          setNewRiderCount(count);
          console.log(`${count} new riders nearby!`);
        }
      }

      setPreviousRiders(newRiders || []);
    },
  });

  const handleLoadNewRiders = useCallback(() => {
    const { clearNewRiders } = useRiderStore.getState();
    clearNewRiders();
    refetch();

    //Scroll to top
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [refetch]);


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

  if (isLoading || !riders) {
    return (
      // <View className="bg-background flex-1 p-2" >
      //   <SearchBarSkeleton />
      //   <HDivider />
      //   <DeliveryListSkeleton />
      // </View>
      <LoadingIndicator />
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

      <NewRidersBanner onPress={handleLoadNewRiders} />

      {/* <LegendList
        data={riders || []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isFetching}
        onRefresh={handleRefresh}
        onLayout={handleLayoutComplete}

      />*/}

      <FlatList
        ref={listRef}
        data={riders || []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshing={isFetching}
        onRefresh={handleRefresh}
        onLayout={handleLayoutComplete}
        onScroll={handleScrollToHide}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={21}
        initialNumToRender={10}
        getItemLayout={getItemLayout}
      />



      {/* <RiderProfile ref={bottomSheetRef} riderData={selectedRider} showButton onPress={handleBookRider} /> */}



      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["35%", '50%']}
        index={-1}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }}
        handleStyle={{ backgroundColor: HANDLE_STYLE }}
        backgroundStyle={{
          borderTopLeftRadius: 60,
          borderTopRightRadius: 60,
          backgroundColor: BG_COLOR,
          shadowColor: theme === 'dark' ? '#fff' : '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: theme === 'dark' ? 0.3 : 0.25,
          shadowRadius: 8,
          elevation: 8
        }}
      >
        <BottomSheetView style={{ flex: 1 }} className={'bg-background'}>
          {selectedRider && (
            <>
              <View className="p-4 items-center flex-1 bg-background">
                <View className="w-28 h-28 rounded-full overflow-hidden">
                  <Image src={selectedRider?.profile_image_url} className="w-28 h-28 rounded-full" />
                </View>
                <Text className="text-primary font-poppins-semibold text-lg mt-1">{selectedRider?.full_name}</Text>

                <View className="flex-row gap-1 items-center mt-1">
                  <Building color={"gray"} size={14} />
                  <Text className="text-muted font-poppins text-sm text-center">{selectedRider?.business_name}</Text>
                </View>
                <View className="flex-row gap-1">
                  <MapPin color={"gray"} size={14} />
                  <Text className="text-muted font-poppins text-sm text-center">{selectedRider?.business_address}</Text>
                </View>
              </View>

              <HDivider />

              <View className="flex-row my-4 justify-between w-[80%] self-center">
                <View className="items-center">
                  <Text className="text-xl font-poppins-bold text-primary">{selectedRider?.delivery_count}</Text>
                  <Text className="font-poppins-light text-muted text-sm">Trips</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xl font-poppins-bold text-primary">{selectedRider?.average_rating}</Text>
                  <Text className="font-poppins-light text-muted text-sm">Rating</Text>
                </View>
                <View className="items-center">
                  <Text className="text-xl font-poppins-bold text-primary">{selectedRider?.bike_number.toUpperCase()}</Text>
                  <Text className="font-poppins-light text-muted text-sm">Bike Number</Text>
                </View>
              </View>

              <View className="bg-background mb-3">
                <AppVariantButton width={'70%'} borderRadius={50} label="Book Rider" onPress={handleBookRider} />
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );


};

export default DeliveryScreen;