import BackButton from "@/components/BackButton";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { AntDesign } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useLocalSearchParams, withLayoutContext } from "expo-router";
import { Bike, Landmark, MapPin, Star } from "lucide-react-native";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from "react-native";

const StoreTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

const StoreHeader = () => {

    const {
        backDrop,
        companyName,
        openingHour,
        closingHour,
        address,
        rating,
        numberOfReviews,
        profileImage,
        delivery
    } = useLocalSearchParams();

    const canDeliver = !!delivery

    return (
        <View className="bg-background">
            <View className="bg-background">
                <Image
                    source={{ uri: backDrop || "https://picsum.photos/600/300.jpg" }}
                    style={{
                        height: 150,
                        width: "100%",
                        objectFit: "cover",
                    }}
                />

                <BackButton />

                <View className="bg-background p-4">
                    <View className="absolute top-[-35px] left-[20px]">
                        <Image
                            source={
                                profileImage && profileImage !== ""
                                    ? { uri: profileImage }
                                    : "https://picsum.photos/300/300.jpg"
                            }
                            style={{
                                height: 65,
                                width: 65,
                                borderRadius: 10,
                                objectFit: "cover",
                            }}
                        />
                    </View>

                    <View className="mt-3">
                        <View className="flex-row gap-2 items-center mt-4">
                            <Landmark color='gray' size={12} />
                            <Text className="text-primary text-sm font-poppins-semibold uppercase">
                                {companyName}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2 mt-2">
                            <MapPin color='gray' size={12} />
                            <Text className="font-poppins text-primary text-sm flex-shrink">
                                {address}
                            </Text>
                        </View>
                        <View className="flex-row justify-between mt-2">
                            <View className="flex-row">
                                <View className="flex-row items-center gap-2">
                                    <Star size={12} color='orange' />
                                    <Text className="text-gray-500  font-poppins text-sm">
                                        {/*{rating.toFix(1)}*/}
                                        {Number(rating).toFixed(1)}
                                    </Text>
                                </View>
                                <Text className="text-gray-500 font-poppins text-sm">
                                    ({numberOfReviews} reviews)
                                </Text>
                            </View>

                            {canDeliver && <Bike color={'orange'} size={20} />}

                            <View className="flex-row gap-2 items-baseline">
                                <AntDesign name="clockcircleo" color="gray" />
                                <Text className="text-gray-500  font-poppins text-sm">
                                    {openingHour} - {closingHour}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );
};


const StoreTabLayout = () => {
    const theme = useColorScheme();
    const BG_COLOR = theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;
    return (
        <>
            <StoreHeader />
            <StoreTabs
                className="bg-background border-b-border-subtle text-primary"
                initialRouteName="index"
                initialLayout={{ width: Dimensions.get("window").width }}
                screenOptions={{
                    tabBarLabelStyle: {
                        fontSize: 12,
                        textAlign: "center",
                        textTransform: "capitalize",
                        fontFamily: "Poppins-Bold",
                    },
                    swipeEnabled: false,
                    tabBarActiveTintColor: theme === 'dark' ? 'white' : 'black',
                    tabBarAndroidRipple: { borderless: false, },
                    tabBarPressOpacity: 0,

                    tabBarIndicatorStyle: {
                        backgroundColor: "orange",
                        height: 3,
                    },
                    tabBarStyle: {
                        backgroundColor: BG_COLOR,
                        borderTopColor: 'orange',
                        borderTopWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: 'gray',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        elevation: 0,
                        shadowOpacity: 0,
                    },
                }}
            >
                <StoreTabs.Screen
                    name="index"
                    options={{
                        tabBarLabel: "Menu",
                    }}
                />
                <StoreTabs.Screen
                    name="reviews"
                    options={{
                        tabBarLabel: "Reviews",
                    }}
                />
            </StoreTabs>
        </>
    );
};

export default StoreTabLayout;
