import { router, useSegments, useRouter, useRootNavigationState } from "expo-router";
import { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { Profile, UserDetails, User, ImageUrl } from "@/types/user-types";

type AuthContextType = {
  // signIn: () => {} | void;
  signOut: () => void;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserDetails | null) => void;
  setImages: (images: ImageUrl | null) => void;
  user?: User | null;
  profile: UserDetails | null;
  images: ImageUrl | null;
};

export const AuthContext = createContext<AuthContextType>({
  signOut: () => null,
  setUser: () => {},
  setProfile: () => {},
  setImages: () => {},
  user: null,
  profile: null,
  images: null,
});

// This hook is used to access the user info.
export function useAuth() {
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

  useEffect(() => {
    if (!navigationState?.key || isFirstLaunch === null) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (isFirstLaunch) {
      router.replace("/(auth)/onboarding");
    } else if (!user && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (user && inAuthGroup) {
      router.replace("/(app)/delivery/(topTabs)");
    }
  }, [user, segments, isFirstLaunch, navigationState?.key]);
}
