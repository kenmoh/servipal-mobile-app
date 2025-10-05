import ProfileCard from "@/components/ProfileCard";
import RadioButton from "@/components/core/RadioButton";
import { KeyRound, LogOutIcon, MoonIcon, Store, SunIcon, UserRound, UsersRound, Wallet } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { logOutUser } from "@/api/auth";
import { ImageData, ImageUpload, uploadProfileImage } from "@/api/user";
import ProfileImagePicker from "@/components/ProfileImagePicker";
import { useToast } from "@/components/ToastProvider";
import authStorage from "@/storage/authStorage";
import { useUserStore } from "@/store/userStore";
import { ImageType } from "@/types/order-types";
import { ImageUrl } from "@/types/user-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";



const BACKDROP_IMAGE_HEIGHT = Dimensions.get("window").height * 0.2;
const BACKDROP_IMAGE_WIDTH = Dimensions.get("window").width;

const profile = () => {
  const [backdropUri, setBackdropUri] = useState<
    ImageType | ImageUpload | null | string
  >(null);
  const [profileUri, setProfileUri] = useState<ImageUrl | null | string>(null);
  const { user, profile, setImages, setStoreId } = useUserStore();
  const { colorScheme, setColorScheme } = useColorScheme();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState(colorScheme);
  const { showError, showSuccess } = useToast()

  useEffect(() => {
    const loadTheme = async () => {
      const storedTheme = await authStorage.getTheme();
      if (storedTheme) {
        setTheme(storedTheme);
        setColorScheme(storedTheme);
      } else {
        setTheme("system");
        setColorScheme("system");
      }
    };
    loadTheme();
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setColorScheme(newTheme);
    authStorage.storeTheme(newTheme);
  };

  // Load stored images on component mount
  useEffect(() => {
    const loadStoredImages = async () => {
      const storedImages = await authStorage.getImageUrl();
      if (storedImages) {
        setImages(storedImages);
      }
    };
    loadStoredImages();
  }, []);

  // Logout user (server side)
  const { mutate } = useMutation({
    mutationKey: ["logout"],
    mutationFn: logOutUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", user?.sub] });
    },
  });

  const handleProfileScreen = () => {
    if (
      user?.user_type === "laundry_vendor" ||
      user?.user_type === "dispatch" ||
      user?.user_type === "restaurant_vendor"
    ) {
      router.push({ pathname: "/profile/vendorProfile" });
    } else {
      router.push({ pathname: "/profile/customerProfile" });
    }
  };

  const handleAddItem = () => {
    if (user?.user_type === "restaurant_vendor") {
      setStoreId(user?.sub)
      router.push({
        pathname: "/restaurant-detail/[restaurantId]",
        params: {
          restaurantId: user.sub,
          companyName: profile?.profile?.business_name,
          backDrop: profile?.profile?.backdrop_image_url,
          profileImage: profile?.profile?.profile_image_url,
          openingHour: profile?.profile?.opening_hours,
          closingHour: profile?.profile?.closing_hours,
          address: profile?.profile?.business_address,
          // rating: profile?.profile?.bank_name,
          // numberOfReviews: profile?.profile?.number_of_reviews,
        },
      });
    } else if (user?.user_type === "laundry_vendor") {
      setStoreId(user?.sub)
      router.push({
        pathname: "/laundry-detail/[laundryId]",
        params: {
          laundryId: user.sub,
          companyName: profile?.profile?.business_name,
          backDrop: profile?.profile?.backdrop_image_url,
          profileImage: profile?.profile?.profile_image_url,
          openingHour: profile?.profile?.opening_hours,
          closingHour: profile?.profile?.closing_hours,
          address: profile?.profile?.business_address,
        },
      });
    }
  };

  // Single mutation for uploading images
  const uploadMutation = useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: async (data) => {
      const newImages = {
        profile_image_url:
          typeof data?.profile_image_url === "object" &&
            data?.profile_image_url !== null
            ? data.profile_image_url.uri
            : (data?.profile_image_url ??
              profile?.profile?.profile_image_url ??
              undefined),
        backdrop_image_url:
          typeof data?.backdrop_image_url === "object" &&
            data?.backdrop_image_url !== null
            ? data.backdrop_image_url.uri
            : (data?.backdrop_image_url ??
              profile?.profile?.backdrop_image_url ??
              undefined),
      };

      // Update context
      setImages(newImages);

      // Store in secure storage
      await authStorage.storeImageUrl(newImages);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
      showSuccess("Success", "Images uploaded successfully")

    },
    onError: (error) => {
      showError("Failed to upload images", "There was an error uploading the images. Please try again.")

    },
  });

  const handleProfileImageSelect = (imageData: ImageData) => {
    setProfileUri(imageData.uri);
    uploadMutation.mutate({
      profile_image_url: imageData,
    });
  };

  const handleBackdropImageSelect = (imageData: ImageData) => {
    setBackdropUri(imageData.uri);
    uploadMutation.mutate({
      backdrop_image_url: imageData,
    });
  };

  const { signOut } = useUserStore();

  const handleLogout = async () => {
    try {
      // First, call the logout API and wait for completion
      // This ensures the server-side logout happens before UI changes
      mutate(undefined, {
        onSuccess: async () => {
          // After server logout, clean up local storage and state
          await authStorage.removeProfile();
          signOut();
        },
        onError: async () => {
          // Even if server logout fails, clean up locally
          await authStorage.removeProfile();
          signOut();
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: still clean up locally even if everything fails
      try {
        await authStorage.removeProfile();
        signOut();
      } catch (fallbackError) {
        console.error('Fallback logout error:', fallbackError);
      }
    }
  };

  return (
    <>
      <View className="flex-1 bg-background">
        <View>
          <View className="'w-full">
            <ProfileImagePicker
              onImageSelect={handleBackdropImageSelect}
              width={BACKDROP_IMAGE_WIDTH}
              height={BACKDROP_IMAGE_HEIGHT}
              borderRadius={0}
              isBackdropImage
              initialImage={profile?.profile?.backdrop_image_url || null}
            />
          </View>

          <View className="flex-row">
            <View className="items-center -mt-12 ml-4">
              <ProfileImagePicker
                onImageSelect={handleProfileImageSelect}
                width={100}
                height={100}
                borderRadius={50}
                initialImage={profile?.profile?.profile_image_url || null}
              />
            </View>

            <View className="items-center mt-2">
              <Text className="capitalize tracking-wide text-lg font-bold text-primary text-center">
                {profile?.profile?.full_name || profile?.profile?.business_name}
              </Text>
              <Text className="text-center text-muted">
                {profile?.profile?.phone_number}
              </Text>
              <Text className="text-center text-muted">{profile?.email}</Text>
            </View>
          </View>

          <View className="mt-10">
            {user?.user_type !== "rider" && (
              <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                <ProfileCard
                  name={"Profile"}
                  onPress={handleProfileScreen}
                  bgColor={"rgba(0,128, 128, 0.3)"}
                  icon={<UserRound color={"white"} />}
                />
              </Animated.View>
            )}
            {(user?.user_type === "restaurant_vendor" ||
              user?.user_type === "laundry_vendor") && (
                <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                  <ProfileCard
                    name={"Store"}
                    onPress={handleAddItem}
                    bgColor={"rgba(9, 3, 94, 0.3)"}
                    icon={<Store color={"white"} />}
                  />
                </Animated.View>
              )}
            {user?.user_type !== "rider" && (
              <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                <ProfileCard
                  name={"Wallet"}
                  onPress={() => router.push({ pathname: "/profile/wallet" })}
                  bgColor={"rgba(241, 121, 8, 0.5)"}
                  icon={<Wallet color={"white"} />}
                />
              </Animated.View>
            )}
            {user?.user_type === "dispatch" && (
              <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                <ProfileCard
                  name={"Riders"}
                  onPress={() => router.push({ pathname: "/profile/riders" })}
                  bgColor={"rgba(5, 90, 247, 0.3)"}
                  icon={<UsersRound color={"white"} />}
                />
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.duration(300).delay(100)}>
              <ProfileCard
                name={"Change Password"}
                onPress={() =>
                  router.push({ pathname: "/profile/changePassword" })
                }
                bgColor={"rgba(221, 218, 11, 0.7)"}
                icon={<KeyRound color={"white"} />}
              />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(300).delay(100)}>
              <ProfileCard
                name="Theme"
                bgColor={"gold"}
                icon={
                  colorScheme === "dark" ? (
                    <SunIcon color={"white"} />
                  ) : (
                    <MoonIcon color={"white"} />
                  )
                }
              >
                <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 10 }}>
                  <RadioButton
                    label="Light"
                    selected={theme === "light"}
                    onPress={() => handleThemeChange("light")}
                  />
                  <RadioButton
                    label="Dark"
                    selected={theme === "dark"}
                    onPress={() => handleThemeChange("dark")}
                  />
                  <RadioButton
                    label="System"
                    selected={theme === "system"}
                    onPress={() => handleThemeChange("system")}
                  />
                </View>
              </ProfileCard>
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(300).delay(100)}>
              <ProfileCard
                name={"Logout"}
                onPress={handleLogout}
                bgColor={"rgba(255, 0, 0, 0.3)"}
                icon={<LogOutIcon color={"white"} />}
              />
            </Animated.View>
          </View>
        </View>
      </View>
    </>
  );
};

export default profile;

const styles = StyleSheet.create({});
