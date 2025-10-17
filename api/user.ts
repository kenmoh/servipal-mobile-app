import { FoodGroup, LaundryMenuItem, MenuItem } from "@/types/item-types";
import {
  CompanyProfile,
  Profile,
  RiderProfile,
  RiderResponse,
  RiderUpdate,
  UserCoords,
  UserDetails,
  UserProfileUpdate,
  Wallet,
} from "@/types/user-types";
import { apiClient } from "@/utils/client";
import { ApiResponse } from "apisauce";
import { ErrorResponse } from "./auth";

export interface ImageData {
  uri: string;
  type: string;
  name: string;
}

export interface ImageUpload {
  profile_image_url?: ImageData | null;
  backdrop_image_url?: ImageData | null;
}

const BASE_URL = "/users";

// Get current user profile
export const getCurrentUserProfile = async (
  userId: string
): Promise<UserDetails> => {
  try {
    const response: ApiResponse<UserDetails | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/${userId}/current-user-profile`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading user profile.";
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

// Get user profile
export const gettUserProfile = async (userId: string): Promise<Profile> => {
  try {
    const response: ApiResponse<Profile | ErrorResponse> = await apiClient.get(
      `${BASE_URL}/${userId}/profile`,
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
          : "Error loading user profile.";
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
// Get rider profile
export const getRiderProfile = async (
  userId: string
): Promise<RiderProfile> => {
  try {
    const response: ApiResponse<RiderProfile | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/${userId}/rider-profile`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading rider profile.";
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
// Get current logged in user
export const getCurrentUserWallet = async (): Promise<Wallet> => {
  try {
    const response: ApiResponse<Wallet | ErrorResponse> = await apiClient.get(
      `${BASE_URL}/user-wallet`,
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
          : "Error loading user wallet.";
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

// Get current logged in user riders
export const getCurrentDispatchRiders = async (): Promise<RiderResponse[]> => {
  try {
    const response: ApiResponse<RiderResponse[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/riders`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading user profile.";
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

// Fetch restaurants
export const fetchRestaurants = async (
  categoryId?: string
): Promise<CompanyProfile[]> => {
  try {
    const response: ApiResponse<CompanyProfile[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/restaurants`, {
        params: categoryId ? { category_id: categoryId } : {},
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading restaurants.";
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

// Fetch laundry users
export const fetchLaundryVendors = async (): Promise<CompanyProfile[]> => {
  try {
    const response: ApiResponse<CompanyProfile[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/laundry-vendors`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading user profile.";
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

// Fetch Vendor Items
export const fetchLaundryMenu = async (
  laundryId: string
): Promise<LaundryMenuItem[]> => {
  try {
    const response: ApiResponse<LaundryMenuItem[] | ErrorResponse> =
      await apiClient.get(`${BASE_URL}/laundry/${laundryId}/menu`, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error fetching laundry menu.";
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

// Fetch Vendor Items
export const fetchRestaurantMenu = async (
  foodGroup: FoodGroup,
  restuarantId: string
): Promise<MenuItem[]> => {
  try {
    const response: ApiResponse<MenuItem[] | ErrorResponse> =
      await apiClient.get(
        `${BASE_URL}/restaurants/${restuarantId}/menu?food_group=${foodGroup}`,
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
          : "Error fetching restaurant menu.";
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

// Update current user
export const updateCurrentVendorUser = async (
  userData: UserProfileUpdate
): Promise<UserDetails> => {
  const data = {
    phone_number: userData.phoneNumber,
    bank_name: userData.bankName,
    bank_account_number: userData.accountNumber,
    business_name: userData.companyName,
    business_registration_number: userData.companyRegNo,
    business_address: userData.location,
    closing_hours: userData.closingHour,
    opening_hours: userData.openingHour,
    state: userData.state,
    can_pickup_and_deliver: userData.canPickup,
    pickup_and_delivery_charge: userData.pickupCharge,
  };
  try {
    const response: ApiResponse<UserDetails | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/profile`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading user profile.";
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

// Update current user
export const updateCurrentCustomer = async (
  userData: UserProfileUpdate
): Promise<UserDetails> => {
  const data = {
    phone_number: userData.phoneNumber,
    bank_name: userData.bankName,
    bank_account_number: userData.accountNumber,
    store_name: userData.storeName,
    business_address: userData.location,
    full_name: userData.fullName,
    state: userData.state,
  };
  try {
    const response: ApiResponse<UserDetails | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/profile`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error loading user profile.";
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

// Dispatch update rider
export const updateRider = async (
  riderId: string,
  riderData: RiderUpdate
): Promise<RiderUpdate> => {
  const data = {
    full_name: riderData.fullName,
    phone_number: riderData.phoneNumber,
    bike_number: riderData.bikeNumber,
  };
  try {
    const response: ApiResponse<RiderUpdate | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/${riderId}/profile`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error updating rider profile.";
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

// Dispatch delete rider
export const deleteRider = async (riderId: string): Promise<null> => {
  try {
    const response: ApiResponse<null | ErrorResponse> = await apiClient.delete(
      `${BASE_URL}/${riderId}/delete`,
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
          : "Error deleting rider.";
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

// upload profile image
export const uploadProfileImage = async (
  imageData: ImageUpload
): Promise<ImageUpload> => {
  const formData = new FormData();

  // Only append images that exist
  if (imageData.profile_image_url) {
    formData.append("profile_image_url", {
      uri: imageData.profile_image_url.uri,
      type: imageData.profile_image_url.type,
      name: imageData.profile_image_url.name,
    } as any);
  }

  if (imageData.backdrop_image_url) {
    formData.append("backdrop_image_url", {
      uri: imageData.backdrop_image_url.uri,
      type: imageData.backdrop_image_url.type,
      name: imageData.backdrop_image_url.name,
    } as any);
  }

  try {
    const response: ApiResponse<ImageUpload | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

    if (!response.ok || !response.data || "detail" in response.data) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error uploading images.";
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

interface NotificationTokenResponse {
  notification_token: string;
}

// Register for notifications
export const registerForNotifications = async (
  pushTokenData: NotificationTokenResponse
): Promise<NotificationTokenResponse> => {
  const data = {
    notification_token: pushTokenData.notification_token,
  };
  try {
    const response: ApiResponse<NotificationTokenResponse | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/notification`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (
      !response.ok ||
      (response.data &&
        typeof response.data === "object" &&
        "detail" in response.data)
    ) {
      const errorMessage =
        response.data &&
        typeof response.data === "object" &&
        "detail" in response.data
          ? response.data.detail
          : "Error registering for notifications.";
      throw new Error(errorMessage);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Register for notifications
export const registerCoordinates = async (
  coords: UserCoords
): Promise<UserCoords> => {
  const data = {
    lat: coords.lat,
    lng: coords.lng,
  };
  try {
    const response: ApiResponse<UserCoords | ErrorResponse> =
      await apiClient.put(`${BASE_URL}/user-coordinates`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    if (
      !response.ok ||
      (response.data &&
        typeof response.data === "object" &&
        "detail" in response.data)
    ) {
      const errorMessage =
        response.data &&
        typeof response.data === "object" &&
        "detail" in response.data
          ? response.data.detail
          : "Error registering for coordinates.";
      throw new Error(errorMessage);
    }
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("An unexpected error occurred");
  }
};

// Delete Account
export const deleteAccount = async (): Promise<void> => {
  try {
    const response: ApiResponse<null | ErrorResponse> = await apiClient.delete(
      `${BASE_URL}/me`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorMessage =
        response.data && "detail" in response.data
          ? response.data.detail
          : "Error deleting account.";
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("An unexpected error occurred while deleting the account.");
  }
};
