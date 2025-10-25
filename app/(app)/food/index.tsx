import React, { useCallback, useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, useColorScheme, View } from "react-native";

import { fetchRestaurants } from "@/api/user";
import AppHeader from "@/components/AppHeader";
import AppTextInput from "@/components/AppInput";
import Category from "@/components/Category";
import StoreCard from "@/components/StoreCard";
import { CompanyProfile } from "@/types/user-types";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { fetchCategories } from "@/api/item";
import Card from "@/components/Card";
import HDivider from "@/components/HDivider";
import GradientCard from '@/components/GradientCard';
import { StoreListSkeleton } from "@/components/LoadingSkeleton";
import RefreshButton from "@/components/RefreshButton";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
// import { useUserStore } from "@/store/userStore";
import { useSwiperCleanup } from "@/hooks/useSwiperCleanup";
import { useUserStore } from "@/store/userStore";

export interface RestaurantWithDistance extends CompanyProfile {
    distance: number;
}

export const featuredRestaurants = [
    {
        id: "f1",
        company_name: "Burger Palace",
        location: "Victoria Island, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500",
        rating: 4.8,
    },
    {
        id: "f2",
        company_name: "Pizza Hub",
        location: "Lekki Phase 1, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
        rating: 4.5,
    },
    {
        id: "f3",
        company_name: "Chicken Republic",
        location: "Ikeja GRA, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
        rating: 4.6,
    },
    {
        id: "f4",
        company_name: "Mama Kitchen",
        location: "Ajah, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
        rating: 4.9,
    },
    {
        id: "f5",
        company_name: "Seafood Paradise",
        location: "Victoria Island, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500",
        rating: 4.7,
    },
    {
        id: "f6",
        company_name: "Suya Express",
        location: "Ikoyi, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
        rating: 4.4,
    },
    {
        id: "f7",
        company_name: "Rice Bowl",
        location: "Maryland, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
        rating: 4.3,
    },
    {
        id: "f8",
        company_name: "Pasta Paradise",
        location: "Yaba, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500",
        rating: 4.6,
    },
    {
        id: "f9",
        company_name: "Sweet Sensation",
        location: "Surulere, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=500",
        rating: 4.5,
    },
    {
        id: "f10",
        company_name: "Local Dishes",
        location: "Ikeja, Lagos",
        company_logo:
            "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500",
        rating: 4.8,
    },
];

const Page = () => {
    const theme = useColorScheme();
    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
    const { user } = useUserStore();
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [filteredRestaurants, setFilteredRestaurants] = useState<
        (CompanyProfile & { distance: number })[]
    >([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const { data, isFetching, error, refetch, isFetched } = useQuery({
        queryKey: ["restaurants", selectedCategory],
        queryFn: () => fetchRestaurants(selectedCategory ?? undefined),
        select: (data) => {
            if (!data || !user?.sub) return data;

            // Find current user's restaurant
            const currentUserRestaurant = data.find(restaurant => restaurant.id === user?.sub);
            const otherRestaurants = data.filter(restaurant => restaurant.id !== user?.sub);

            // Sort other restaurants by distance or any other criteria
            otherRestaurants.sort((a, b) => a.distance - b.distance);

            // Return with current user's restaurant first
            return currentUserRestaurant
                ? [currentUserRestaurant, ...otherRestaurants]
                : otherRestaurants;
        }
    });



    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        select: (categories) =>
            categories?.filter((category) => category.category_type === "food") || [],
    });

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Get user's location
    useEffect(() => {
        const getUserLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const location = await Location.getCurrentPositionAsync({});

            if (location) {

                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            }

        };

        getUserLocation();
    }, []);

    // Filter restaurants by location after API returns category-filtered data
    // useEffect(() => {
    //     const filterRestaurants = async () => {
    //         if (!data || !userLocation) {
    //             setFilteredRestaurants([]);
    //             return;
    //         }

    //         try {
    //             const restaurantsWithDistance = await Promise.all(
    //                 data.map(async (restaurant) => {
    //                     const coordinates = await getCoordinatesFromAddress(
    //                         restaurant.location
    //                     );
    //                     if (!coordinates) return null;

    //                     const distance = await getTravelDistance(
    //                         userLocation.latitude,
    //                         userLocation.longitude,
    //                         coordinates.lat,
    //                         coordinates.lng
    //                     );


    //                     if (distance === null || distance > 35) return null;


    //                     return {
    //                         ...restaurant,
    //                         distance,
    //                     } as RestaurantWithDistance;
    //                 })
    //             );

    //             // Filter out null values first
    //             const validRestaurants = restaurantsWithDistance.filter(
    //                 (item): item is RestaurantWithDistance => item !== null
    //             );

    //             let currentVendorRestaurant = null;
    //             let otherRestaurants = validRestaurants;

    //             if (user?.user_type === "restaurant_vendor") {
    //                 // Find the current vendor's restaurant
    //                 currentVendorRestaurant = validRestaurants.find(
    //                     (restaurant) => restaurant.id === user.sub
    //                 );

    //                 if (currentVendorRestaurant) {
    //                     setHasItem(true);
    //                 } else {
    //                     setHasItem(false);
    //                 }

    //                 // Remove current vendor's restaurant from others list
    //                 otherRestaurants = validRestaurants.filter(
    //                     (restaurant) => restaurant.id !== user.sub
    //                 );
    //             }

    //             // Sort other restaurants by distance
    //             otherRestaurants.sort((a, b) => a.distance - b.distance);

    //             // Combine results - current vendor first, then others
    //             const finalResults = currentVendorRestaurant
    //                 ? [currentVendorRestaurant, ...otherRestaurants]
    //                 : otherRestaurants;

    //             setFilteredRestaurants(finalResults);
    //         } catch (error) {
    //             console.error("Error filtering restaurants by distance:", error);
    //         }
    //     };

    //     filterRestaurants();
    // }, [data, userLocation, user?.sub, user?.user_type, selectedCategory]);

    if (isFetching) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: BG_COLOR }}>
                <AppHeader
                    component={
                        <AppTextInput

                            borderRadius={50}
                            placeholder="Search Restaurants.."
                        />
                    }
                />
                <HDivider />
                <StoreListSkeleton />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <RefreshButton label="Error loading restaurants" onPress={refetch} />
        );
    }


    const showEmptyState = isFetched && filteredRestaurants.length === 0;
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BG_COLOR }}>
            <AppHeader
                component={
                    <AppTextInput

                        borderRadius={50}
                        placeholder="Search.."
                    />
                }
            />
            <HDivider />


            <FlatList
                data={data || []}
                ListHeaderComponent={() => (
                    <>
                        <Category
                            categories={categories || []}
                            onCategorySelect={setSelectedCategory}
                            selectedCategory={selectedCategory}
                        />
                       {data.length === 0 &&  <GradientCard label="Delicious Meals at Your Doorstep" description="Order from your favourite restaurants and enjoy fast, fresh food delivery." />}
                        {/*<FeaturedRestaurants />*/}
                    </>
                )}
                stickyHeaderIndices={[1]}
                ListEmptyComponent={<EmptySearch selectedCategory={selectedCategory!} />}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                refreshing={isFetching}
                onRefresh={handleRefresh}
                renderItem={({
                    item,
                }: {
                    item: CompanyProfile & { distance: number };
                }) => (
                    <StoreCard
                        item={item}
                        distance={item.distance}
                        pathName='/restaurant-detail/[restaurantId]'
                    />
                )}
                contentContainerStyle={{
                    paddingBottom: 10,
                }}
            />



        </SafeAreaView>
    );
};

export default Page;


const EmptySearch = ({ selectedCategory }: { selectedCategory: string }) => {
    return (
        <View className='flex-1 justify-center items-center p-4' >
            <Text className="text-lg text-primary text-center" >
                {selectedCategory ? "No restaurants found in this category" : "No restaurants found nearby"}
            </Text>
            <Text className='text-sm text-muted text-center mt-2' >
                {selectedCategory
                    ? "Try selecting a different category or clear the filter"
                    : "We couldn't find any restaurants within 35km of your location"
                }
            </Text>
        </View>

    )
}

export const FeaturedRestaurants = () => {
    const swiperRef = useSwiperCleanup();

    return (
        <View className='h-[220px]'>
            <View className='flex-row px-4 py-2 justify-between items-center'

            >
                <Text className="text-primary text-[16px]" >
                    Featured Restaurants
                </Text>
            </View>

            <Swiper
                ref={swiperRef}
                autoplay
                autoplayTimeout={3}
                showsPagination={false}
                loop
                height={200}
                showsButtons={false}
                bounces={false}
                removeClippedSubviews={false}
                containerStyle={{ paddingHorizontal: 10 }}
            >
                {featuredRestaurants?.map((restaurant) => (
                    <View className='w-[90%] overflow-hidden' key={restaurant.id} >
                        <Card
                            style={{
                                width: '100%'
                            }}
                        >
                            <Image
                                source={{ uri: restaurant.company_logo }}
                                style={styles.image}
                            />
                            {/* Gradient overlay for better text visibility */}
                            <LinearGradient
                                colors={["transparent", "rgba(0,0,0,0.7)"]}
                                style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: 80,
                                }}
                            />
                            <View className="absolute bottom-0 p-3 w-full" >
                                <Text
                                    className='text-sm text-primary'
                                    numberOfLines={1}

                                >
                                    {restaurant.company_name}
                                </Text>
                                <Text className="text-xs text-primary mt-1 opacity-90"

                                    numberOfLines={1}

                                >
                                    {restaurant.location}
                                </Text>
                            </View>
                        </Card>
                    </View>
                ))}
            </Swiper>
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
});
