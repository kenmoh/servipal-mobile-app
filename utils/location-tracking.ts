import { updateDeliveryLocation } from "@/api/order";
import { updateUserLocation } from "@/api/user";
import { Coordinates } from "@/types/order-types";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

let currentTrackingInterval: NodeJS.Timeout | null = null;
let currentDeliveryId: string | null = null;
let currentRiderId: string | null = null;

// Background task name
const BACKGROUND_LOCATION_TASK = "background-location-task";

// Define the background task
TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error("Background location task error:", error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    if (locations && locations.length > 0) {
      const location = locations[0];
      console.log("📍 Background location update received:", location.coords);
      
      try {
        // Send user location update
        await sendUserLocationUpdate(
          location.coords.latitude,
          location.coords.longitude
        );
      } catch (err) {
        console.error("Failed to send location update:", err);
      }
    }
  }
});


/**
 * Starts sending rider location every 5 minutes for the active delivery
 */
export const startDeliveryTracking = async (
  deliveryId: string,
  riderId: string
): Promise<void> => {
  if (!deliveryId || !riderId) {
    console.warn("🚫 Tracking not started: missing deliveryId or riderId");
    return;
  }
  // Stop any existing tracking
  stopDeliveryTracking();

  // Store current context
  currentDeliveryId = deliveryId;
  currentRiderId = riderId;

  // Request location permission
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== "granted") {
    console.warn("Location permission denied — tracking disabled");
    return;
  }

  // Send first location immediately
  await sendCurrentLocation();

  // Then send every 5 minutes
  currentTrackingInterval = setInterval(
    sendCurrentLocation,
    5 * 60 * 1000
  ) as unknown as NodeJS.Timeout;
};

/**
 * Starts sending user location using background location tracking
 */
export const startUpdatingUserLocation = async (): Promise<void> => {
  try {
    // Check if already running
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK
    );
    
    if (isRegistered) {
      console.log("📍 Background location tracking already running");
      return;
    }

    // Request foreground permission first
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== "granted") {
      console.warn("Foreground location permission denied");
      return;
    }

    // Request background permission
    const { status: backgroundStatus } =
      await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== "granted") {
      console.warn("Background location permission denied");
      return;
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 5 * 60 * 1000, // 5 minutes
      distanceInterval: 0, // Update based on time interval
      showsBackgroundLocationIndicator: true, // iOS only
      foregroundService: {
        notificationTitle: "Location Tracking",
        notificationBody: "Your location is being tracked in the background",
        notificationColor: "#FF0000",
      },
    });

    console.log("✅ Background location tracking started");
  } catch (error) {
    console.error("❌ Failed to start background location tracking:", error);
  }
};

/**
 * Stops background location tracking
 */
export const stopUpdatingUserLocation = async (): Promise<void> => {
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(
      BACKGROUND_LOCATION_TASK
    );
    
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
      console.log("📍 Background location tracking stopped");
    } else {
      console.log("📍 Background location tracking was not running");
    }
  } catch (error) {
    console.error("❌ Failed to stop background location tracking:", error);
  }
};

/**
 * Stops tracking immediately
 */
export const stopDeliveryTracking = (): void => {
  if (currentTrackingInterval) {
    clearInterval(currentTrackingInterval);
    currentTrackingInterval = null;
  }
  currentDeliveryId = null;
  currentRiderId = null;
  console.log("📍 Delivery tracking stopped");
};

/**
 * Helper function to send user location update
 */
const sendUserLocationUpdate = async (
  latitude: number,
  longitude: number
): Promise<void> => {
  try {
    const coords = {
      lat: latitude,
      lng: longitude,
    };

    await updateUserLocation(coords);
    console.log("✅ User location sent from background:", coords);
  } catch (error) {
    console.error("❌ Failed to send user location from background:", error);
  }
};

/**
 * Sends current location to backend (called every 5 min + on start)
 */
const sendCurrentLocation = async (): Promise<void> => {
  if (!currentDeliveryId || !currentRiderId) return;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;

    const coords: Coordinates = [latitude, longitude];
    console.log("Coords before send:", coords);

    await updateDeliveryLocation(currentDeliveryId, currentRiderId, coords);
    console.log("✅ Location sent for delivery:", currentDeliveryId, coords);
  } catch (error) {
    console.error("❌ Failed to send location:", error);
  }
};
/**
 * Sends current location to backend (called every 5 min + on start)
 */
// const sendUserLocation = async (): Promise<void> => {
//   if (!currentDeliveryId || !currentRiderId) return;

//   try {
//     const location = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.High,
//     });

//     const { latitude, longitude } = location.coords;

//     const coords = {
//       lat: latitude,
//       lng: longitude,
//     };
//     console.log("Coords before send:", coords);

//     await updateUserLocation(coords);
//     console.log("✅ User location sent:", coords);
//   } catch (error) {
//     console.error("❌ Failed to send location:", error);
//   }
// };
