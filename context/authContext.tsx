import { ImageUrl, User, UserDetails } from "@/types/user-types";
import { useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  // signIn: () => {} | void;
  signOut: () => void;
  setUser: (user: User | null) => void;
  setStoreId: (storeId: string | null) => void;
  setStoreAddress: (storeAddress: string | null) => void;
  setProfile: (profile: UserDetails | null) => void;
  setImages: (images: ImageUrl | null) => void;
  user?: User | null;
  storeId?: string | null
  storeAddress?: string | null
  profile: UserDetails | null;
  images: ImageUrl | null;
};

export const AuthContext = createContext<AuthContextType>({
  signOut: () => null,
  setUser: () => { },
  setStoreId: () => null,
  setStoreAddress: () => null,
  setProfile: () => { },
  setImages: () => { },
  user: null,
  storeId: null,
  storeAddress: null,
  profile: null,
  images: null,
});

// This hook is used to access the user info.
export function useAuth(); {
  return useContext(AuthContext);
}

// This hook will protect the route access based on user authentication.
export function useProtectedRoute(user: {} | null) {
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await SecureStore.getItemAsync("hasLaunched");
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await SecureStore.setItemAsync("hasLaunched", "true");
      } else {
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // useEffect(() => {
  //   if (!navigationState?.key || isFirstLaunch === null) return;

  //   const inAuthGroup = segments[0] === "(auth)";

  //   if (isFirstLaunch) {
  //     router.replace("/(auth)/onboarding");
  //   } else if (!user && !inAuthGroup) {
  //     router.replace("/(auth)/sign-in");
  //   } else if (user && inAuthGroup) {
  //     router.replace("/(app)/delivery/(topTabs)");
  //   }
  // }, [user, segments, isFirstLaunch, navigationState?.key]);
}
