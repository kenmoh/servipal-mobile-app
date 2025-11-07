import HDivider from "@/components/HDivider";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { AntDesign, Feather } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useLocalSearchParams, withLayoutContext } from "expo-router";
import { Bike } from "lucide-react-native";
import {Stack} from 'expo-router'
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
        storeId,
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
        <>
            <View className="bg-background mb-[-15px]">
                <View className="bg-background">
                    <Image
                        src={backDrop || "https://picsum.photos/600/300.jpg"}
                        style={{
                            height: 150,
                            width: "100%",
                            objectFit: "cover",
                        }}
                    />
                    <View className="bg-background p-4">
                        <View className="absolute top-[-35px] left-[20px]">
                            <Image
                                src={profileImage || "https://picsum.photos/200/200.jpg"}
                                style={{
                                    height: 65,
                                    width: 65,
                                    borderRadius: 10,
                                    objectFit: "cover",
                                }}
                            />
                        </View>

                        <View className="mt-3">
                            <Text className="text-primary mt-4 text-sm font-poppins-semibold uppercase">
                                {companyName}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-2">
                                <Feather name="map-pin" color="gray" size={12} />
                                <Text className="font-poppins text-primary text-sm flex-shrink">
                                    {address}
                                </Text>
                            </View>
                            <View className="flex-row justify-between place-items-baseline my-3">
                                <View className="flex-row items-center gap-2 ">
                                    <AntDesign name="staro" color="orange" />
                                    <Text className="text-gray-500  font-poppins text-sm">
                                        {rating}
                                    </Text>
                                </View>
                                <Text className="text-gray-500 font-poppins text-sm">
                                    ({numberOfReviews} reviews)
                                </Text>
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
            </View >
            <HDivider />
        </>
    );
};

const StoreTabLayout = () => {
    const theme = useColorScheme();
    return (
        <>
            {/*<StoreHeader />*/}
            <Stack
                initialRouteName="index"
                initialLayout={{ width: Dimensions.get("window").width }}
                screenOptions={{
                headerShadowVisible: false,
                headerTintColor: theme === "dark" ? "white" : "black",
                headerStyle: {
                  backgroundColor: theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                },
                contentStyle: {
                  backgroundColor: theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                  // flex: 1
                },
              }}
                        // screenOptions={{
                //     tabBarLabelStyle: {
                //         fontSize: 12,
                //         textAlign: "center",
                //         textTransform: "capitalize",
                //         fontFamily: "Poppins-Bold",
                //     },
                //     swipeEnabled: false,
                //     tabBarActiveTintColor: theme === "dark" ? "white" : "black",
                //     tabBarInactiveTintColor:
                //         theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                //     tabBarAndroidRipple: { borderless: false },
                //     tabBarPressOpacity: 0,
                //     tabBarIndicatorStyle: {
                //         backgroundColor: "orange",
                //         height: 3,
                //     },
                //     tabBarStyle: {
                //         backgroundColor:
                //             theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                //         borderBottomColor:
                //             theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                //         borderBottomWidth: StyleSheet.hairlineWidth,
                //         elevation: 0,
                //         shadowOpacity: 0,
                //     },
                // }}
            >
                <Stack.Screen
                    name="index"
                    options={{
                        // tabBarLabel: "Menu",
                        title: '',
                        // header: ()=><StoreHeader/>
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="reviews"
                    options={{
                        // tabBarLabel: "Reviews",
                    }}
                />
            </Stack>
        </>
    );
};

export default StoreTabLayout;
