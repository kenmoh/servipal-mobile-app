import {
  CreateReview,
  DeliveryDetail,
  OrderFoodOLaundry,
  SendItem,
} from "@/types/order-types";
import { PaymentLink } from "@/types/payment";
import { apiClient } from "@/utils/client";
import { ApiResponse } from "apisauce";
import { ErrorResponse } from "./auth";

const BASE_URL = "/orders";

export type DeliveryType = "food" | "laundry" | "package";

interface FetchDeliveriesParams {
  skip?: number;
  limit?: number;
}

// Fetch Paid Pending Deliveries
export const fetchPaidPendingDeliveries = async (): Promise<
  DeliveryDetail[]
> => {
  try {
    const response: ApiResponse<DeliveryDetail[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/paid-pending-deliveries`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching deliveries.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
// Fetch Paid Pending Deliveries
export const fetchUserRelatedOrders = async (
  userId: string
): Promise<DeliveryDetail[]> => {
  try {
    const response: ApiResponse<DeliveryDetail[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/${userId}/user-related-orders`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching deliveries.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Fetch Deliveries
export const fetchDeliveries = async ({
  skip = 0,
  limit = 25,
}: FetchDeliveriesParams = {}): Promise<DeliveryDetail[]> => {
  const params = new URLSearchParams();

  // if (deliveryType) {
  //   params.append("delivery_type", deliveryType.toString());
  // }
  if (typeof skip === "number") {
    params.append("skip", skip.toString());
  }
  if (typeof limit === "number") {
    params.append("limit", limit.toString());
  }
  try {
    const response: ApiResponse<DeliveryDetail[] | ErrorResponse> =
      await apiClient.get(
        `${BASE_URL}${params.toString() ? `?${params.toString()}` : ""}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching deliveries.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Fetch Delivery
export const fetchOrder = async (orderId: string): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching delivery.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Send Item
export const sendItem = async (itemData: SendItem): Promise<DeliveryDetail> => {
  const data = new FormData();
  data.append("name", itemData.name);
  data.append("description", itemData.description);
  data.append("origin", itemData.origin);
  data.append("destination", itemData.destination);
  data.append("duration", itemData.duration);

  // Format coordinates without array brackets
  if (itemData.pickup_coordinates) {
    const [lat, lng] = itemData.pickup_coordinates;
    data.append("pickup_coordinates", `${lat}, ${lng}`);
  }

  if (itemData.dropoff_coordinates) {
    const [lat, lng] = itemData.dropoff_coordinates;
    data.append("dropoff_coordinates", `${lat}, ${lng}`);
  }
  data.append("distance", itemData.distance?.toString());

  // Handle image
  if (itemData.imageUrl) {
    const imageInfo = {
      uri: itemData.imageUrl,
      type: "image/jpeg",
      name: `image-${Date.now()}.jpg`,
    };
    data.append("image_url", imageInfo as any);
  }

  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.post(`${BASE_URL}/send-item`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating item. Please try again later.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Order Food/Laundry
export const createOrder = async (
  vendorId: string,
  orderData: OrderFoodOLaundry
): Promise<DeliveryDetail> => {
  const data = {
    order_items: orderData.order_items,
    pickup_coordinates: orderData.pickup_coordinates,
    dropoff_coordinates: orderData.dropoff_coordinates,
    distance: orderData.distance,
    require_delivery: orderData.require_delivery,
    duration: orderData.duration,
    origin: orderData.origin,
    destination: orderData.destination,
    additional_info: orderData.additional_info,
  };

  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.post(`${BASE_URL}/${vendorId}`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating category.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Confirm Item Received by sender
export const updateOrderStatus = async (
  orderId: string
): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/${orderId}/vendor-update-order-status`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error updating order status.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
// Confirm Item Received by sender
export const senderConfirmDeliveryReceived = async (
  deliveryId: string
): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${deliveryId}/sender-confirm-delivery-or-order-received`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error confirming delivery.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Rider Accept Delivery
export const riderAcceptDelivery = async (
  orderId: string
): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${orderId}/accept-delivery`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error confirming delivery.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Sender Mark Delivery In Transit
export const markLaundryReceived = async (
  deliveryId: string
): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${deliveryId}/laundry-received`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "An error occured! Try again.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Rider Mark Delivery Delivered
export const riderMarkDelivered = async (
  deliveryId: string
): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${deliveryId}/delivered`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error confirming delivery.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

type CancelData = {
  cancelReason: string;
};

export const cancelDelivery = async (
  orderId: string,
  cancelData: CancelData
): Promise<DeliveryDetail> => {
  const data = {
    reason: cancelData.cancelReason,
  };

  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${orderId}/cancel-order-or-delivery`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error cancelling delivery.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
export const relistDelivery = async (
  deliveryId: string
): Promise<DeliveryDetail> => {
  try {
    const response: ApiResponse<DeliveryDetail | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${deliveryId}/re-list-item`,

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error relisting delivery.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Create review
export const createReview = async (
  orderId: string,
  revData: CreateReview
): Promise<CreateReview> => {
  const data = {
    rating: revData.rating,
    comment: revData.comment,
  };
  try {
    const response: ApiResponse<CreateReview | ErrorResponse> =
      await apiClient.post(`${BASE_URL}/${orderId}/review`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error creating review. Please try again";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// export const getTravelDistance = async (
//   userLat: number,
//   userLng: number,
//   destinationLat: number,
//   destinationLng: number
// ): Promise<number | null> => {
//   try {
//     const origin = `${userLat},${userLng}`;
//     const destination = `${destinationLat},${destinationLng}`;

//     const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination}&origins=${origin}&units=metric&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`;

//     const response = await fetch(url);
//     const data = await response.json();

//     const distanceInMeters = data?.rows?.[0]?.elements?.[0]?.distance?.value;

//     if (distanceInMeters) {
//       // Convert meters to kilometers
//       return distanceInMeters / 1000;
//     }

//     return null;
//   } catch (error) {
//     throw new Error(`Error calculating travel distance: ${error}`);
//   }
// };

export const getTravelDistance = async (
  userLat: number,
  userLng: number,
  destinationLat: number,
  destinationLng: number
): Promise<number | null> => {
  try {
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${userLng},${userLat};${destinationLng},${destinationLat}?geometries=geojson&overview=false&access_token=${process.env.EXPO_PUBLIC_MAPBOX_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" && data.message) {
      console.warn(`Mapbox API error: ${data.code} - ${data.message}`);
      console.log("Mapbox URL for failed request:", url);
      return null;
    }

    const distanceInMeters = data?.routes?.[0]?.distance;

    if (distanceInMeters) {
      // Convert meters → kilometers
      return distanceInMeters / 1000;
    }

    return null;
  } catch (error) {
    throw new Error(`Error calculating travel distance (Mapbox): ${error}`);
  }
};

export const generateOrderPaymentLink = async (
  orderId: string
): Promise<PaymentLink> => {
  try {
    const response: ApiResponse<PaymentLink | ErrorResponse> =
      await apiClient.put(
        `${BASE_URL}/${orderId}/generate-new-payment-link`,

        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error generating payment link.";
      throw new Error(errorMessage);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};
