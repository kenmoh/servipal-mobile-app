import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { AntDesign, Feather } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useLocalSearchParams, withLayoutContext } from "expo-router";
import { Dimensions, Image, StyleSheet, Text, useColorScheme, View } from 'react-native';


const StoreTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

const StoreHeader = () => {
    const theme = useColorScheme();
    const { user } = useAuth()
    const {
        backDrop,
        companyName,
        openingHour,
        closingHour,
        address,
        rating,
        numberOfReviews,
        profileImage,
    } = useLocalSearchParams();

    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT


    return (
        <View className='bg-background' >
            <View className='bg-input'>
                <Image
                    source={
                        backDrop && backDrop !== ""
                            ? { uri: backDrop }
                            : require("@/assets/images/Burge.jpg")
                    }
                    style={{
                        height: 150,
                        width: '100%',
                        objectFit: "cover",
                    }}
                />
                <View className='p-2 bg-profile-card' >
                    <View className='absolute top-[-35px] left-5'>
                        <Image
                            source={
                                profileImage && profileImage !== ""
                                    ? { uri: profileImage }
                                    : require("@/assets/images/Burge.jpg")
                            }
                            style={{
                                height: 65,
                                width: 65,
                                borderRadius: 10,
                                objectFit: "cover",
                            }}
                        />
                    </View>

                    <View className='mt-3'>
                        <Text className='text-primary font-poppins-bold uppercase text-[16px]'

                        >
                            {companyName}
                        </Text>
                        <View className='flex-row justify-between'>
                            <View className='flex-row items-center gap-2 mt-2'>
                                <AntDesign name="staro" color='orange' />
                                <Text
                                    className='text-icon-default font-poppins-bold'

                                >
                                    {rating}
                                </Text>
                                <Text
                                    className='text-icon-default font-poppins-bold'
                                >
                                    ({numberOfReviews} reviews)
                                </Text>
                            </View>
                            <View className='flex-row items-center gap-2'>
                                <AntDesign name="clockcircleo" className={'text-icon-default'} />
                                <Text
                                    className='text-icon-default font-poppins-semibold'
                                >
                                    color={"$icon"}
                                    fontFamily={"$body"}
                                    fontSize={"$2"}

                                    {openingHour} - {closingHour}
                                </Text>
                            </View>
                        </View>
                        <View className='items-center gap-2' >
                            <Feather name="map-pin" className='text-icon-default' size={12} />
                            <Text
                                className='text-icon-default font-poppins-semibold'

                            >
                                {address}
                            </Text>
                        </View>

                    </View>
                </View>
            </View>
        </View>
    );
};

const StoreTabLayout = () => {
    const theme = useColorScheme()
    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
    return (
        <>
            <StoreHeader />
            <StoreTabs
                className='bg-background border-b-border-subtle text-primary'
                initialRouteName="index"
                initialLayout={{ width: Dimensions.get('window').width }}
                screenOptions={{
                    tabBarLabelStyle: {
                        fontSize: 12,
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        fontFamily: 'Poppins-Bold',
                    },
                    swipeEnabled: false,
                    // tabBarActiveTintColor: theme.text.val,
                    // tabBarInactiveTintColor: theme.borderColor.val,
                    tabBarAndroidRipple: { borderless: false },
                    tabBarPressOpacity: 0,
                    tabBarIndicatorStyle: {
                        backgroundColor: 'orange',
                        height: 3,
                    },
                    tabBarStyle: {
                        backgroundColor: BG_COLOR,
                        // borderBottomColor: theme.borderColor.val,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        elevation: 0,
                        shadowOpacity: 0,
                    }
                }}
            >
                <StoreTabs.Screen
                    name="index"
                    options={{
                        tabBarLabel: 'Menu',
                    }}
                />
                <StoreTabs.Screen
                    name="reviews"
                    options={{
                        tabBarLabel: 'Reviews',
                    }}
                />
            </StoreTabs>
        </>
    )
}

export default StoreTabLayout;