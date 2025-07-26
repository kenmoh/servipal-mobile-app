import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme'
import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'


const PaymentStatusLayout = () => {

    const theme = useColorScheme()
    return (
        <Stack>

            <Stack.Screen name='[orderId]' options={{

                title: '',
                animation: 'slide_from_bottom',
                headerStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,

                },

            }} />

            <Stack.Screen name='payment-complete' options={{
                animation: 'slide_from_bottom',
                headerShown: false,
                headerStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,

                },

            }} />

            <Stack.Screen name='deep-link-handler' options={{
                animation: 'none',
                headerShown: false,
                presentation: 'transparentModal',
            }} />

            <Stack.Screen name='transfer-detail' options={{
                title: 'Transfer Details',
                animation: 'slide_from_bottom',

                presentation: 'transparentModal',
                headerStyle: {
                    backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT

                },
            }} />

        </Stack>
    )
}

export default PaymentStatusLayout

const styles = StyleSheet.create({})