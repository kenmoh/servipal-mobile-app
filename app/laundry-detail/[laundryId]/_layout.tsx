import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";


const StoreTabLayout = () => {
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
                name="(laundry-tab)"
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
