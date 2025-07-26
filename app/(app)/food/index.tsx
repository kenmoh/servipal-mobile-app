import React, { useEffect, useState, } from "react";
import { FlatList, Image, StyleSheet, Text, useColorScheme, View } from "react-native";

import { getTravelDistance } from "@/api/order";
import { fetchRestaurants } from "@/api/user";
import AppHeader from "@/components/AppHeader";
import AppTextInput from "@/components/AppInput";
import Category from "@/components/Category";
import StoreCard from "@/components/StoreCard";
import { CompanyProfile } from "@/types/user-types";
import { getCoordinatesFromAddress } from "@/utils/geocoding";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import * as Location from "expo-location";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { fetchCategories } from "@/api/item";
import Card from "@/components/Card";
import HDivider from "@/components/HDivider";
import { StoreListSkeleton } from "@/components/LoadingSkeleton";
import RefreshButton from "@/components/RefreshButton";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useAuth } from "@/context/authContext";

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
    const { user } = useAuth();
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [filteredRestaurants, setFilteredRestaurants] = useState<
        (CompanyProfile & { distance: number })[]
    >([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [hasItem, setHasItem] = useState(false);

    const { data, isFetching, isPending, error, isLoading, refetch } = useQuery({
        queryKey: ["restaurants", selectedCategory],
        queryFn: () => fetchRestaurants(selectedCategory ?? undefined),
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        select: (categories) =>
            categories?.filter((category) => category.category_type === "food") || [],
    });

    // Get user's location
    useEffect(() => {
        const getUserLocation = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;

            const location = await Location.getCurrentPositionAsync({});
            setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
        };

        getUserLocation();
    }, []);

    // Filter restaurants by location after API returns category-filtered data
    useEffect(() => {
        const filterRestaurants = async () => {
            if (!data || !userLocation) {
                setFilteredRestaurants([]);
                return;
            }

            const restaurantsWithDistance = await Promise.all(
                data.map(async (restaurant) => {
                    const coordinates = await getCoordinatesFromAddress(
                        restaurant.location
                    );
                    if (!coordinates) return null;

                    const distance = await getTravelDistance(
                        userLocation.latitude,
                        userLocation.longitude,
                        coordinates.lat,
                        coordinates.lng
                    );

                    if (!distance || distance > 100) return null;

                    return {
                        ...restaurant,
                        distance,
                    } as RestaurantWithDistance;
                })
            );

            // Filter out null values first
            const validRestaurants = restaurantsWithDistance.filter(
                (item): item is RestaurantWithDistance => item !== null
            );

            let currentVendorRestaurant = null;
            let otherRestaurants = validRestaurants;

            if (user?.user_type === "restaurant_vendor") {
                // Find the current vendor's restaurant
                currentVendorRestaurant = validRestaurants.find(
                    (restaurant) => restaurant.id === user.sub
                );

                if (currentVendorRestaurant) {
                    setHasItem(true);
                } else {
                    setHasItem(false);
                }

                // Remove current vendor's restaurant from others list
                otherRestaurants = validRestaurants.filter(
                    (restaurant) => restaurant.id !== user.sub
                );
            }

            // Sort other restaurants by distance
            otherRestaurants.sort((a, b) => a.distance - b.distance);

            // Combine results - current vendor first, then others
            const finalResults = currentVendorRestaurant
                ? [currentVendorRestaurant, ...otherRestaurants]
                : otherRestaurants;

            setFilteredRestaurants(finalResults);
        };

        filterRestaurants();
    }, [data, userLocation, user?.sub, user?.user_type, selectedCategory]);

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

    const showEmptyState = !isFetching && !isPending && !isLoading && filteredRestaurants.length === 0;

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

            {showEmptyState ? (
                <View className='flex-1 justify-center items-center p-4' >
                    <Text className="text-lg text-primary text-center" >
                        {selectedCategory ? "No restaurants found in this category" : "No restaurants found nearby"}
                    </Text>
                    <Text className='text-sm text-primary text-center mt-2' >
                        {selectedCategory
                            ? "Try selecting a different category or clear the filter"
                            : "We couldn't find any restaurants within 100km of your location"
                        }
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredRestaurants}
                    ListHeaderComponent={() => (
                        <>
                            <Category
                                categories={categories || []}
                                onCategorySelect={setSelectedCategory}
                                selectedCategory={selectedCategory}
                            />
                            <FeaturedRestaurants />
                        </>
                    )}
                    stickyHeaderIndices={[1]}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item) => item.id}
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
            )}

        </SafeAreaView>
    );
};

export default Page;

export const FeaturedRestaurants = () => {


    return (
        <View className='h-[220px]'>
            <View className='flex-row px-4 py-2 justify-between items-center'

            >
                <Text className="text-primary text-[16px]" >
                    Featured Restaurants
                </Text>
            </View>

            <Swiper
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
                    <View className='w-[90px] p-2' key={restaurant.id} >
                        <Card
                        // width="100%"
                        // height={160}
                        // overflow="hidden"
                        // backgroundColor="$cardBackground"
                        // elevation={3}
                        // shadowColor="$shadowColor"
                        // shadowOffset={{ width: 0, height: 2 }}
                        // shadowOpacity={0.25}
                        // shadowRadius={3.84}
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









// import React, { useEffect, useState, useCallback } from "react";
// import { StyleSheet, FlatList, Image } from "react-native";
// import {
//     Card,
//     Heading,
//     Paragraph,
//     XStack,
//     YStack,
//     Separator,
// } from "tamagui";
// import StoreCard from "@/components/StoreCard";
// import * as Location from "expo-location";
// import { useTheme, View } from "tamagui";
// import { useQuery } from "@tanstack/react-query";
// import { fetchRestaurants } from "@/api/user";
// import LoadingIndicator from "@/components/LoadingIndicator";
// import { SafeAreaView } from "react-native-safe-area-context";
// import Category from "@/components/Category";
// import AppTextInput from "@/components/AppInput";
// import AppHeader from "@/components/AppHeader";
// import { CompanyProfile } from "@/types/user-types";
// import Swiper from "react-native-swiper";
// import { LinearGradient } from "expo-linear-gradient";
// import { getCoordinatesFromAddress } from "@/utils/geocoding";
// import { getTravelDistance } from "@/api/order";
// import FAB from "@/components/FAB";
// import { router } from "expo-router";
// import { useAuth } from "@/context/authContext";
// import { Plus } from "lucide-react-native";
// import { fetchCategories } from "@/api/item";
// import RefreshButton from "@/components/RefreshButton";
// import { StoreListSkeleton } from "@/components/LoadingSkeleton";

// export interface RestaurantWithDistance extends CompanyProfile {
//     distance: number;
// }
// export const featuredRestaurants = [
//     {
//         id: "f1",
//         company_name: "Burger Palace",
//         location: "Victoria Island, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500",
//         rating: 4.8,
//     },
//     {
//         id: "f2",
//         company_name: "Pizza Hub",
//         location: "Lekki Phase 1, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
//         rating: 4.5,
//     },
//     {
//         id: "f3",
//         company_name: "Chicken Republic",
//         location: "Ikeja GRA, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500",
//         rating: 4.6,
//     },
//     {
//         id: "f4",
//         company_name: "Mama Kitchen",
//         location: "Ajah, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500",
//         rating: 4.9,
//     },
//     {
//         id: "f5",
//         company_name: "Seafood Paradise",
//         location: "Victoria Island, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1559847844-5315695dadae?w=500",
//         rating: 4.7,
//     },
//     {
//         id: "f6",
//         company_name: "Suya Express",
//         location: "Ikoyi, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
//         rating: 4.4,
//     },
//     {
//         id: "f7",
//         company_name: "Rice Bowl",
//         location: "Maryland, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500",
//         rating: 4.3,
//     },
//     {
//         id: "f8",
//         company_name: "Pasta Paradise",
//         location: "Yaba, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=500",
//         rating: 4.6,
//     },
//     {
//         id: "f9",
//         company_name: "Sweet Sensation",
//         location: "Surulere, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1621274403997-37aace184f49?w=500",
//         rating: 4.5,
//     },
//     {
//         id: "f10",
//         company_name: "Local Dishes",
//         location: "Ikeja, Lagos",
//         company_logo:
//             "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500",
//         rating: 4.8,
//     },
// ];

// const Page = () => {
//     const theme = useTheme();
//     const { user } = useAuth();
//     const [userLocation, setUserLocation] = useState<{
//         latitude: number;
//         longitude: number;
//     } | null>(null);
//     const [filteredRestaurants, setFilteredRestaurants] = useState<
//         (CompanyProfile & { distance: number })[]
//     >([]);
//     const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

//     const [hasItem, setHasItem] = useState(false);
//     const { data, isFetching, error, refetch } = useQuery({
//         queryKey: ["restaurants", selectedCategory],
//         queryFn: () => fetchRestaurants(selectedCategory ?? undefined),
//     });

//     const { data: categories } = useQuery({
//         queryKey: ["categories"],
//         queryFn: fetchCategories,
//         select: (categories) =>
//             categories?.filter((category) => category.category_type === "food") || [],
//     });

//     // Get user's location
//     useEffect(() => {
//         const getUserLocation = async () => {
//             const { status } = await Location.requestForegroundPermissionsAsync();
//             if (status !== "granted") return;

//             const location = await Location.getCurrentPositionAsync({});
//             setUserLocation({
//                 latitude: location.coords.latitude,
//                 longitude: location.coords.longitude,
//             });
//         };

//         getUserLocation();
//     }, []);

//     useEffect(() => {
//         const filterRestaurants = async () => {
//             if (!data || !userLocation) return;

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

//                     if (!distance || distance > 100) return null;

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
//         };

//         filterRestaurants();
//     }, [data, userLocation, user?.sub, user?.user_type]);

//     if (isFetching) {
//         return (
//             <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
//                 <AppHeader
//                     component={
//                         <AppTextInput
//                             height="$3.5"
//                             borderRadius={50}
//                             placeholder="Search Restaurants.."
//                         />
//                     }
//                 />
//                 <Separator />
//                 <StoreListSkeleton />
//             </SafeAreaView>
//         );
//     }

//     if (error)
//         return (
//             <RefreshButton label="Error loading restaurants" onPress={refetch} />
//         );

//     return (
//         <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.val }}>
//             <AppHeader
//                 component={
//                     <AppTextInput
//                         height="$3.5"
//                         borderRadius={50}
//                         placeholder="Search Restaurants.."
//                     />
//                 }
//             />
//             <Separator />

//             {filteredRestaurants.length > 0 && (
//                 <FlatList
//                     data={filteredRestaurants}
//                     ListHeaderComponent={() => (
//                         <>
//                             <Category
//                                 categories={categories || []}
//                                 onCategorySelect={setSelectedCategory}
//                                 selectedCategory={selectedCategory}
//                             />
//                             <FeaturedRestaurants />
//                         </>
//                     )}
//                     stickyHeaderIndices={[1]}
//                     showsVerticalScrollIndicator={false}
//                     keyExtractor={(item) => item.id}
//                     renderItem={({
//                         item,
//                     }: {
//                         item: CompanyProfile & { distance: number };
//                     }) => (
//                         <StoreCard
//                             item={item}
//                             distance={item.distance}
//                             pathName='/restaurant-detail/[restaurantId]'
//                         />
//                     )}
//                     contentContainerStyle={{
//                         paddingBottom: 10,
//                     }}
//                 />
//             )}
//             {/* 
//             {user?.user_type === "restaurant_vendor" && !hasItem && (
//                 <FAB
//                     icon={<Plus size={25} color={theme.text.val} />}
//                     onPress={() => router.push({ pathname: "/restaurant-detail/addMenu" })}
//                 />
//             )} */}
//         </SafeAreaView>
//     );
// };

// export default Page;

// interface FeaturedRestaurantsProps {
//     restaurants: CompanyProfile[];
// }

// export const FeaturedRestaurants = () => {
//     const theme = useTheme();

//     return (
//         <YStack height={220}>
//             <XStack
//                 paddingHorizontal="$4"
//                 paddingVertical="$2"
//                 justifyContent="space-between"
//                 alignItems="center"
//             >
//                 <Heading color="$text" fontSize={16}>
//                     Featured Restaurants
//                 </Heading>
//             </XStack>

//             <Swiper
//                 autoplay
//                 autoplayTimeout={3}
//                 showsPagination={false}
//                 loop
//                 height={200}
//                 showsButtons={false}
//                 bounces={false}
//                 removeClippedSubviews={false}
//                 containerStyle={{ paddingHorizontal: 10 }}
//             >
//                 {featuredRestaurants?.map((restaurant) => (
//                     <YStack key={restaurant.id} width="90%" marginHorizontal="$2">
//                         <Card
//                             width="100%"
//                             height={160}
//                             overflow="hidden"
//                             backgroundColor="$cardBackground"
//                             elevation={3}
//                             shadowColor="$shadowColor"
//                             shadowOffset={{ width: 0, height: 2 }}
//                             shadowOpacity={0.25}
//                             shadowRadius={3.84}
//                         >
//                             <Image
//                                 source={{ uri: restaurant.company_logo }}
//                                 style={styles.image}
//                             />
//                             {/* Gradient overlay for better text visibility */}
//                             <LinearGradient
//                                 colors={["transparent", "rgba(0,0,0,0.7)"]}
//                                 style={{
//                                     position: "absolute",
//                                     bottom: 0,
//                                     left: 0,
//                                     right: 0,
//                                     height: 80,
//                                 }}
//                             />
//                             <YStack position="absolute" bottom={0} padding="$3" width="100%">
//                                 <Heading
//                                     fontSize={14}
//                                     color="white"
//                                     numberOfLines={1}
//                                     shadowColor="black"
//                                     shadowOffset={{ width: 0, height: 1 }}
//                                     shadowOpacity={0.5}
//                                     shadowRadius={2}
//                                 >
//                                     {restaurant.company_name}
//                                 </Heading>
//                                 <Paragraph
//                                     fontSize={12}
//                                     color="white"
//                                     numberOfLines={1}
//                                     marginTop="$1"
//                                     opacity={0.9}
//                                     shadowColor="black"
//                                     shadowOffset={{ width: 0, height: 1 }}
//                                     shadowOpacity={0.5}
//                                     shadowRadius={2}
//                                 >
//                                     {restaurant.location}
//                                 </Paragraph>
//                             </YStack>
//                         </Card>
//                     </YStack>
//                 ))}
//             </Swiper>
//         </YStack>
//     );
// };

// const styles = StyleSheet.create({
//     image: {
//         width: "100%",
//         height: "100%",
//         resizeMode: "cover",
//     },
// });


