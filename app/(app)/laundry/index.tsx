import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, useColorScheme, View } from "react-native";

import StoreCard from "@/components/StoreCard";
import * as Location from "expo-location";

import { getTravelDistance } from "@/api/order";
import { fetchLaundryVendors } from "@/api/user";
import AppHeader from "@/components/AppHeader";
import AppTextInput from "@/components/AppInput";
import Card from "@/components/Card";
import HDivider from "@/components/HDivider";
import RefreshButton from "@/components/RefreshButton";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
// import { useUserStore } from "@/store/userStore";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useUserStore } from "@/store/userStore";
import { CompanyProfile } from "@/types/user-types";
import { getCoordinatesFromAddress } from "@/utils/geocoding";
import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

export interface LaundryWithDistance extends CompanyProfile {
    distance: number;
}
export const featuredLaundryVendors = [
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
    const { user } = useUserStore();
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [filteredlaundryVendors, setFilteredLaundryVendors] = useState<
        (CompanyProfile & { distance: number })[]
    >([]);
    const [filteredFeatured, setFilteredFeatured] = useState<
        LaundryWithDistance[]
    >([]);

    const [hasItem, setHasItem] = useState(false);

    const { data, isFetching, error, refetch } = useQuery({
        queryKey: ["laundryVendors"],
        queryFn: fetchLaundryVendors,
    });

    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT


    const [showComingSoon, setShowComingSoon] = useState(false);

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
    useEffect(() => {
        setShowComingSoon(!isFetching && (!data || filteredlaundryVendors.length === 0));
    }, [isFetching, data, filteredlaundryVendors.length]);

    useEffect(() => {
        const filterLaundryVendors = async () => {
            if (!data || !userLocation) return;

            const laundrysWithDistance = await Promise.all(
                data.map(async (laundry) => {
                    const coordinates = await getCoordinatesFromAddress(
                        laundry.location
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
                        ...laundry,
                        distance,
                    } as LaundryWithDistance;
                })
            );

            // Filter out null values first
            const validLaundry = laundrysWithDistance.filter(
                (item): item is LaundryWithDistance => item !== null
            );

            let currentVendorLaundry = null;
            let otherLaundryVendors = validLaundry;

            if (user?.user_type === "laundry_vendor") {
                // Find the current vendor's restaurant
                currentVendorLaundry = validLaundry.find(
                    (laundry) => laundry.id === user.sub
                );

                if (currentVendorLaundry) { setHasItem(true) }

                // Remove current vendor's restaurant from others list
                otherLaundryVendors = validLaundry.filter(
                    (laundry) => laundry.id !== user.sub
                );
            }

            // Sort other restaurants by distance
            otherLaundryVendors.sort((a, b) => a.distance - b.distance);

            // Combine results - current vendor first, then others
            const finalResults = currentVendorLaundry
                ? [currentVendorLaundry, ...otherLaundryVendors]
                : otherLaundryVendors;

            setFilteredLaundryVendors(
                finalResults as (CompanyProfile & { distance: number })[]
            );
        };

        filterLaundryVendors();
    }, [data, userLocation, user?.sub, user?.user_type]);

    if (isFetching) {
        return <LoadingIndicator />
    }

    if (error)
        return (
            <RefreshButton label="Error loading laundry vendours" onPress={refetch} />
        );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BG_COLOR }}>
            <AppHeader
                component={
                    <AppTextInput

                        borderRadius={50}
                        placeholder="Search laundry vedours.."
                    />
                }
            />
            <HDivider />


            <FlatList
                // data={data}
                data={data}
                // ListHeaderComponent={() => (
                //     <>

                //         <FeaturedLaundryVendors />
                //         {/* <FeaturedRestaurants restaurants={data || []} /> */}
                //     </>
                // )}
                stickyHeaderIndices={[1]}
                ListHeaderComponent={() => (
                    <>

                        {/* {<GradientCard label="Laundry Services Made Simple" description="Choose from a wide range of laundry services providers and have your clothes cleaned and delivered." />} */}
                        {/*<FeaturedRestaurants />*/}
                    </>
                )}
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
                        pathName='/laundry-detail/[laundryId]'
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

interface FeaturedRestaurantsProps {
    restaurants: CompanyProfile[];
}

export const FeaturedLaundryVendors = () => {
    const theme = useColorScheme();

    return (
        <View className='h-[220px]'>
            <View className="flex-row px-4 py-2 justify-between items-center"

            >
                <Text className="text-[16px] text-primary">
                    Featured Restaurants
                </Text>
                {/* <Text color="$btnPrimaryColor" fontSize={12}>See All</Text> */}
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
                {featuredLaundryVendors?.map((laundry) => (
                    <View className='mx-2 w-[90%] overflow-hidden' key={laundry.id}>
                        <Card
                            style={{
                                width: '100%'
                            }}

                        >
                            <Image
                                source={{ uri: laundry.company_logo }}
                                style={styles.image}
                            />

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
                            <View className='absolute bottom-0 p-3 w-full' >
                                <Text className="text-sm text-white font-poppins-bold opacity-90"

                                    numberOfLines={1}
                                // shadowColor="black"
                                // shadowOffset={{ width: 0, height: 1 }}
                                // shadowOpacity={0.5}
                                // shadowRadius={2}
                                >
                                    {laundry.company_name}
                                </Text>
                                <Text className="text-xs mt-1 opacity-90 text-white font-poppins-light"


                                    numberOfLines={1}
                                // marginTop="$1"
                                // opacity={0.9}
                                // shadowColor="black"
                                // shadowOffset={{ width: 0, height: 1 }}
                                // shadowOpacity={0.5}
                                // shadowRadius={2}
                                >
                                    {laundry.location}
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
