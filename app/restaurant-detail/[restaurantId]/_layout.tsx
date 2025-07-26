import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";


const StoreTabLayout = () => {
    const theme = useColorScheme();
    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
    return (
        <Stack
            screenOptions={{
                headerShadowVisible: false,
                headerStyle: {
                    backgroundColor: BG_COLOR,
                },
            }}
        >

            <Stack.Screen
                name="(restaurant-tab)"
                options={{
                    headerTransparent: true,
                    headerShown: false

                }}
            />
        </Stack>
    );
};

export default StoreTabLayout;

const styles = StyleSheet.create({});
