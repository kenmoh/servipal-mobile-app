import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme'
import { Stack } from 'expo-router'
import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'


const LaundryLayout = () => {
    const theme = useColorScheme()

    return (
        <Stack screenOptions={{
            headerStyle: {
                backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
            }
        }}>
            <Stack.Screen name='index' options={{

                headerShown: false
            }} />
        </Stack>
    )
}

export default LaundryLayout

const styles = StyleSheet.create({})