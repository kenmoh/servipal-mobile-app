import React, { ReactNode, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext, useProtectedRoute } from "@/context/authContext";
import authStorage from '@/storage/authStorage'
import { User, UserDetails, ImageUrl } from "@/types/user-types";
import { router } from "expo-router";
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient()


const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDetails | null>(null);
  const [images, setImages] = useState<ImageUrl | null>(null);

  // const restoreToken = async () => {
  //     try {
  //         const token = await authStorage.getToken();
  //         if (!token) {
  //             setUser(null);
  //             setProfile(null);
  //             setImages(null);
  //             return;
  //         }

  //         // Set user from token
  //         setUser(jwtDecode(token));

  //         // Load profile and images
  //         const [storedProfile, storedImages] = await Promise.all([
  //             authStorage.getProfile(),
  //             authStorage.getImageUrl()
  //         ]);

  //         if (storedProfile) {
  //             setProfile(storedProfile);
  //         }
  //         if (storedImages) {
  //             setImages(storedImages);
  //         }
  //     } catch (error) {
  //         console.error('Error restoring session:', error);
  //         setUser(null);
  //         setProfile(null);
  //         setImages(null);
  //     }
  // };

  const restoreToken = async () => {
    try {
      const token = await authStorage.getToken();
      if (!token) {
        setUser(null);
        setProfile(null);
        setImages(null);
        return;
      }

      // Set user from token
      const decodedUser = jwtDecode<User>(token);
      setUser(decodedUser);

      // Only load cached data initially, API query will override with fresh data
      const [storedProfile, storedImages] = await Promise.all([
        authStorage.getProfile(),
        authStorage.getImageUrl()
      ]);

      // Set cached data as fallback (will be overridden by API query)
      if (storedProfile) {
        setProfile(storedProfile);
      }
      if (storedImages) {
        setImages(storedImages);
      }
    } catch (error) {
      console.error('Error restoring session:', error);
      setUser(null);
      setProfile(null);
      setImages(null);
    }
  };

  useEffect(() => {
    restoreToken();
  }, []);


  useEffect(() => {
    const checkAuth = async () => {
      const token = await authStorage.getToken();
      if (!token) {
        signOut();
      }
    };

    // Check auth status every minute
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const signOut = async () => {
    try {
      await Promise.all([
        authStorage.removeToken(),
        authStorage.removeProfile(),
        authStorage.removeImage()
      ]);
      setUser(null);
      setProfile(null);
      setImages(null);
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.clear();

      router.replace("/(auth)/sign-in");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  useProtectedRoute(user);
  return (
    <AuthContext.Provider value={{ signOut, setUser, user, images, setImages, setProfile, profile }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
