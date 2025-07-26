import { fetchUnreadBadgeCount } from "@/api/report";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import { useQuery } from "@tanstack/react-query";
import { router, Stack } from "expo-router";
import { BellIcon } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";



const HeaderRight = ({
    onPressNotification,
}: {
    onPressSearch: () => void;
    onPressNotification: () => void;
}) => {

    const { user } = useAuth()
    const theme = useColorScheme()
    const {
        data: badges,
    } = useQuery({
        queryKey: ["notification-badge"],
        queryFn: () => fetchUnreadBadgeCount(user?.sub as string),
        // refetchInterval: 5000),
        enabled: !!user?.sub,
    });



    return (
        <View className="gap-3" >
            <View className="">
                <TouchableOpacity onPressIn={onPressNotification}>
                    <BellIcon color={theme === 'dark' ? "#fff" : "#aaa"} />
                </TouchableOpacity>
                {/* Badge for unread notifications */}
                {badges && badges.unread_count > 0 && (
                    <View
                        style={{
                            position: 'absolute',
                            top: -5,
                            right: -5,
                            backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderWidth: 2,

                        }}
                    >
                        <Text
                            style={{
                                color: 'white',
                                fontSize: 10,
                                fontWeight: 'bold',
                                fontFamily: 'Poppins-Bold',
                            }}
                        >
                            {badges.unread_count > 99 ? '99+' : badges.unread_count}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
};
const HeaderLeft = () => {
    return (
        <View className="gap-4">

            <View className='overflow-hidden w-[55px] h-[55px] rounded-full items-center justify-center'>
                <Image source={require('@/assets/images/android-icon.png')}
                    style={{
                        width: 55,
                        height: 55,
                        resizeMode: 'contain'
                    }}
                />
            </View>
        </View>
    );
};

const DeliveryLayout = () => {
    const theme = useColorScheme()
    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,

                },
                contentStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                    // flex: 1
                },
            }}
        >
            <Stack.Screen
                name="(topTabs)"
                options={{
                    title: "ServiPal",
                    headerTitleStyle: { color: theme === 'dark' ? 'white' : 'black', fontFamily: 'Poppins-Bold', fontSize: 22, },
                    headerStyle: { backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT },

                    headerLeft: () => <HeaderLeft />,
                    headerRight: () => (
                        <HeaderRight
                            onPressNotification={() =>
                                // router.push({ pathname: "/(app)/delivery/notification" })
                                router.push({ pathname: '/channel' })
                            }
                            onPressSearch={() =>
                                router.push({ pathname: "/(app)/delivery" })
                            }
                        />
                    ),
                    animation: "ios_from_left",
                }}
            />

            <Stack.Screen
                name="sendItem"
                options={{
                    title: "Enter Location",
                    presentation: "modal",
                }}
            />
            <Stack.Screen
                name="notification"
                options={{
                    title: "Notifications",
                }}
            />
            <Stack.Screen
                name="itemInfo"
                options={{
                    title: "",
                }}
            />

        </Stack>
    );
};

export default DeliveryLayout;

const styles = StyleSheet.create({});
