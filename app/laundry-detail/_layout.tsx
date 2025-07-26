import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";


const LaundryDetailLayout = () => {
    const theme = useColorScheme();
    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                },
            }}
        >
            <Stack.Screen
                name="[laundryId]"
                options={{
                    headerShown: false,
                    headerStyle: {
                        backgroundColor: "transparent",

                    },
                }}
            />

            <Stack.Screen
                name="addLaundryItem"

                options={{
                    title: 'Add Item',
                    animation: 'slide_from_bottom'

                }}
            />


        </Stack>
    );
};

export default LaundryDetailLayout;

