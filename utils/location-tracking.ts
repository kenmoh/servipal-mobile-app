import { updateDeliveryLocation } from "@/api/order";
import { updateUserLocation } from "@/api/user";
import { Coordinates } from "@/types/order-types";
import * as Location from "expo-location";

let currentTrackingInterval: NodeJS.Timeout | null = null;
let currentDeliveryId: string | null = null;
let currentRiderId: string | null = null;


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
 * Sends current location to backend (called every 5 min + on start)
 */
const sendCurrentLocation = async (): Promise<void> => {
  if (!currentDeliveryId || !currentRiderId) return;

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = location.coords;

    const payload: UpdateDeliveryLocation = {
      rider_id: currentRiderId,
      last_known_rider_coordinates: [latitude, longitude] as Coordinates,
    };

    console.log("Sending location to API:", payload);

    const response = await updateDeliveryLocation(currentDeliveryId, payload);
    console.log("API Response:", response);
  } catch (error: any) {
    console.error("Failed to send location:", error?.message || error);
  }
};
// const sendCurrentLocation = async (): Promise<void> => {
//   if (!currentDeliveryId || !currentRiderId) return;

//   try {
//     const location = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.High,
//     });

//     const { latitude, longitude } = location.coords;

//     const coords: Coordinates = [latitude, longitude];
  
//     const locationData = {
//       rider_id: currentRiderId,
//       last_known_rider_coordinates: coords
//     }

//     console.log("Location Data before send:", locationData);

//     await updateDeliveryLocation(currentDeliveryId, locationData);
//     console.log("✅ Location sent for delivery:", currentDeliveryId, locationData);
//   } catch (error) {
//     console.error("❌ Failed to send location:", error);
//   }
// };
