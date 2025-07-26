import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, useColorScheme } from 'react-native';


const AuthLayout = () => {
    const theme = useColorScheme()
    return (
        <Stack screenOptions={{
            title: '',
            headerStyle: {
                backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
            },
            contentStyle: {
                backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
            }
        }}>
            <Stack.Screen name='sign-in' options={{ headerShown: false }} />
            <Stack.Screen name='sign-up' />
            <Stack.Screen name='confirm-account' />
            <Stack.Screen name='forgot-password' />
        </Stack>
    )
}

export default AuthLayout

const styles = StyleSheet.create({})