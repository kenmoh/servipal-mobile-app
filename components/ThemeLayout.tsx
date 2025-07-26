import { StatusBar } from 'expo-status-bar'
import React from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ThemeLayout = ({ children }: { children: React.ReactNode }) => {

    const statusStyle = useColorScheme()
    return (
        <SafeAreaView className='flex-1 bg-background' >

            {children}
            <StatusBar translucent={false} style={statusStyle === 'dark' ? 'light' : 'dark'} backgroundColor={statusStyle === 'dark' ? '#000' : '#fff'} />
        </SafeAreaView>
    )
}

export default ThemeLayout

const styles = StyleSheet.create({})