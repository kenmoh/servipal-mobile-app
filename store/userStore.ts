import authStorage from "@/storage/authStorage";
import { ImageUrl, User, UserDetails } from "@/types/user-types";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

interface UserStore {
  user: User | null;
  profile: UserDetails | null;
  images: ImageUrl | null;
  storeId: string | null;
  storeAddress: string | null;
  isFirstLaunch: boolean | null;

  setUser: (user: User | null) => void;
  setProfile: (profile: UserDetails | null) => void;
  setImages: (images: ImageUrl | null) => void;
  setStoreId: (storeId: string | null) => void;
  setStoreAddress: (storeAddress: string | null) => void;

  restoreToken: () => Promise<void>;
  signOut: () => Promise<void>;
  checkFirstLaunch: () => Promise<boolean>;
  setFirstLaunchComplete: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  profile: null,
  images: null,
  storeId: null,
  storeAddress: null,
  isFirstLaunch: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setImages: (images) => set({ images }),
  setStoreId: (storeId) => set({ storeId }),
  setStoreAddress: (storeAddress) => set({ storeAddress }),

  checkFirstLaunch: async () => {
    try {
      const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
      const isFirst = hasLaunched === null;
      set({ isFirstLaunch: isFirst });
      return isFirst;
    } catch (error) {
      console.error("Error checking first launch:", error);
      set({ isFirstLaunch: true });
      return true;
    }
  },

  setFirstLaunchComplete: async () => {
    try {
      await SecureStore.setItemAsync("hasLaunched", "true");
      set({ isFirstLaunch: false });
    } catch (error) {
      console.error("Error setting first launch complete:", error);
    }
  },

  restoreToken: async () => {
    try {
      const token = await authStorage.getToken();
      if (!token) {
        set({ user: null, profile: null, images: null });
        return;
      }

      const decodedUser = jwtDecode<User>(token);
      set({ user: decodedUser });

      const [storedProfile, storedImages] = await Promise.all([
        authStorage.getProfile(),
        authStorage.getImageUrl(),
      ]);

      if (storedProfile) set({ profile: storedProfile });
      if (storedImages) set({ images: storedImages });
    } catch (error) {
      console.error("Error restoring session:", error);
      set({ user: null, profile: null, images: null });
    }
  },

  signOut: async () => {
    try {
      await Promise.all([
        authStorage.removeToken(),
        authStorage.removeProfile(),
        authStorage.removeImage(),
      ]);

      set({
        user: null,
        profile: null,
        images: null,
        storeId: null,
        storeAddress: null,
      });

      router.replace("/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  },
}));
