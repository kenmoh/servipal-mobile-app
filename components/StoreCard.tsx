import { useLocationStore } from "@/store/locationStore";
import { CompanyProfile } from "@/types/user-types";
import { getCoordinatesFromAddress } from '@/utils/geocoding';
import { AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RelativePathString, router, type Href } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";

const IMAGET_HEIGHT = Dimensions.get("window").height * 0.25;

const StoreCard = ({
    item,
    distance,
    pathName,
}: {
    distance?: number;
    item: CompanyProfile;
    pathName: Href;
}) => {

    const theme = useColorScheme();
    const {

        setOrigin,

    } = useLocationStore()

    const handleStoreSelect = async () => {
        const address = item?.location;
        if (address) {
            const coords = await getCoordinatesFromAddress(address);
            if (coords) {
                setOrigin(address, [coords.lat, coords.lng]);
            }
        }
        router.push({
            pathname: pathName as RelativePathString,
            params: {
                storeId: item?.id,
                companyName: item?.company_name,
                backDrop: item?.backdrop_image_url,
                profileImage: item?.profile_image,
                openingHour: item?.opening_hour,
                closingHour: item?.closing_hour,
                address: item?.location,
                rating: item?.rating?.average_rating,
                numberOfReviews: item?.rating.number_of_reviews,
            },
        });
    };

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleStoreSelect}
        >
            <View className="self-center w-[90%]  rounded-lg overflow-hidden my-5"

                style={{

                    height: IMAGET_HEIGHT,

                }}
            >

                {/* Background Image */}
                <Image
                    source={{ uri: item?.backdrop_image_url }}
                    style={styles.image}
                />

                {/* Gradient Overlay */}
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.gradient}
                />

                {/* Rating Badge */}
                {parseInt(item?.rating.average_rating) > 0 && (
                    <View style={styles.ratingBadge}>
                        <Text className="text-primary font-poppins-bold">
                            {item?.rating?.average_rating}
                        </Text>
                        <AntDesign
                            name="star"
                            size={14}
                            color={'orange'}
                        />
                    </View>
                )}

                {/* Content */}
                <View className='absolute bottom-0 p-3 w-full gap-1'

                >
                    <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 }} className="self-start px-2 py-1"


                    >
                        <Text className="text-[16px]"

                            numberOfLines={1}
                            style={{
                                fontFamily: "Poppins-Bold",
                                color: theme === 'dark' ? '#fff' : '#fff'
                            }}
                        >
                            🏪{item?.company_name}
                        </Text>
                    </View>

                    <View className="items-center flex-row gap-2" >
                        <Text className="text-sm text-white opacity-90"

                            numberOfLines={1}
                        >
                            {item?.location}
                        </Text>
                        {distance && (
                            <Text className="text-primary text-sm">
                                • {distance.toFixed(1)}km away
                            </Text>
                        )}
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    ratingBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        flexDirection: "row",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignItems: "center",
        gap: 4,
    },
});

export default StoreCard;
