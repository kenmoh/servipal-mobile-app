import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Stack } from 'expo-router'

const DeliveryDetailLayout = () => {
    return (
        <Stack>

            <Stack.Screen name='[id]' options={{
                headerTransparent: true,
                title: '',
                headerShown: false,
                headerStyle: {
                    backgroundColor: 'trasparent',

                },
                animation: 'fade_from_bottom',
                // headerTintColor: theme.icon.val,



            }} />

        </Stack>
    )
}

export default DeliveryDetailLayout

const styles = StyleSheet.create({})