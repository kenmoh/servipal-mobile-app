import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';




const ProfileLayout = () => {

    const theme = useColorScheme()



    return (
        <View className='flex-1 bg-background'>

            <Stack screenOptions={{

                headerShadowVisible: false,
                headerTintColor: theme === 'dark' ? '#eee' : '#aaa',
                headerStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,

                },
                contentStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                },

                animation: 'fade',


            }} >

                <Stack.Screen name='index' options={{
                    title: '',
                    headerShown: false,


                }} />
                <Stack.Screen name='addRider' options={{
                    title: 'Add Rider',

                }} />

                <Stack.Screen name='changePassword'
                    options={{
                        title: 'Change Password',
                        animation: 'fade_from_bottom',


                    }}
                />
                <Stack.Screen name='wallet' options={{
                    title: 'Wallet',
                    animation: 'slide_from_bottom',
                    headerShadowVisible: false,
                    headerShown: true,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    contentStyle: {
                        backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                    },
                }} />
                <Stack.Screen name='riders' options={{
                    title: 'Riders',
                    animation: "slide_from_right"
                }} />
                <Stack.Screen name='fund-wallet' options={{
                    title: 'Fund Wallet',
                    animation: 'slide_from_bottom',
                    headerShown: true,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    contentStyle: {
                        backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                    },
                }} />
                <Stack.Screen name='wallet-payment' options={{
                    title: 'Wallet Top-up',
                    animation: 'slide_from_bottom',
                }} />
                <Stack.Screen name='[transactionId]' options={{
                    title: '',
                    animation: 'slide_from_right',
                }} />
                <Stack.Screen name='vendorProfile' options={{
                    title: 'Update Profile',
                    animation: 'slide_from_left',

                }} />
                <Stack.Screen name='customerProfile' options={{
                    title: 'Update Profile',
                    animation: 'slide_from_right',


                }} />

            </Stack>
        </View>
    )
}

export default ProfileLayout

const styles = StyleSheet.create({})