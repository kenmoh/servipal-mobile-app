import { Profile, UserDetails, ImageUrl } from "@/types/user-types";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";

const profileKey = "userProfile";
const imageKey = "imageKey";
const key = "authToken";
const pushTokenKey = "pushToken";
const emailKey = "userEmail";

interface JWTPayload {
  exp: number;
  iat: number;
  sub: string;
  account_status: "pending" | "confirmed";
  user_type: string;
}

const storeToken = async (authToken: string) => {
  try {
    await SecureStore.setItemAsync(key, authToken);
  } catch (error) {
    throw new Error("Error storing auth token", error!);
  }
};

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;

    return decoded.exp < currentTime + 60;
  } catch (error) {
    console.error("Token validation error:", error);
    return true;
  }
};

const getUser = async (): Promise<JWTPayload | null> => {
  const token = await getToken();
  try {
    return token ? jwtDecode<JWTPayload>(token) : null;
  } catch (error) {
    console.error("Error decoding user token:", error);
    return null;
  }
};

const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(key);
    if (!token) return null;

    // Check if token is expired
    if (isTokenExpired(token)) {
      await removeToken();
      return null;
    }

    return token;
  } catch (error) {
    throw new Error("Error getting auth token", error!);
  }
};

const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    throw new Error("Error deleting auth token", error!);
  }
};

const storeProfile = async (profile: UserDetails) => {
  try {
    const profileString = JSON.stringify(profile);
    await SecureStore.setItemAsync(profileKey, profileString);
  } catch (error) {
    console.error("Error storing user profile:", error);
    throw new Error("Error storing user profile");
  }
};

const getProfile = async (): Promise<UserDetails | null> => {
  try {
    const profileString = await SecureStore.getItemAsync(profileKey);
    if (!profileString) return null;
    return JSON.parse(profileString) as UserDetails;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

const removeProfile = async () => {
  try {
    await SecureStore.deleteItemAsync(profileKey);
  } catch (error) {
    throw new Error("Error removing user profile");
  }
};

const storeImageUrl = async (imageUrl: ImageUrl) => {
  try {
    const imageString = JSON.stringify(imageUrl);
    await SecureStore.setItemAsync(imageKey, imageString);
  } catch (error) {
    console.error("Error storing user profile:", error);
    throw new Error("Error storing user Image");
  }
};

const getImageUrl = async (): Promise<ImageUrl | null> => {
  try {
    const imageString = await SecureStore.getItemAsync(imageKey);
    if (!imageString) return null;
    return JSON.parse(imageString) as ImageUrl;
  } catch (error) {
    console.error("Error getting user Image:", error);
    return null;
  }
};

const removeImage = async () => {
  try {
    await SecureStore.deleteItemAsync(imageKey);
  } catch (error) {
    console.error("Error removing user Image:", error);
    throw new Error("Error removing user Image");
  }
};

const storePushToken = async (token: string) => {
  try {
    await SecureStore.setItemAsync(pushTokenKey, token);
  } catch (error) {
    throw new Error("Error storing push token", error!);
  }
};

const getPushToken = async () => {
  try {
    return await SecureStore.getItemAsync(pushTokenKey);
  } catch (error) {
    throw new Error("Error getting push token", error!);
  }
};

const removePushToken = async () => {
  try {
    await SecureStore.deleteItemAsync(pushTokenKey);
  } catch (error) {
    throw new Error("Error removing push token", error!);
  }
};

const storeEmail = async (email: string) => {
  try {
    await SecureStore.setItemAsync(emailKey, email);
  } catch (error) {
    throw new Error("Error storing user email", error!);
  }
};

const getEmail = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(emailKey);
  } catch (error) {
    throw new Error("Error getting user email", error!);
  }
};

const removeEmail = async () => {
  try {
    await SecureStore.deleteItemAsync(emailKey);
  } catch (error) {
    throw new Error("Error removing user email", error!);
  }
};

export default {
  getToken,
  getUser,
  removeToken,
  storeToken,
  getProfile,
  removeProfile,
  storeProfile,
  getImageUrl,
  removeImage,
  storeImageUrl,
  storePushToken,
  getPushToken,
  removePushToken,
  storeEmail,
  getEmail,
  removeEmail,
};
