import { router } from 'expo-router'
import { ArrowLeft, ChevronLeft } from 'lucide-react-native'
import React from 'react'
import { Platform, TouchableOpacity, useColorScheme } from 'react-native'


const BackButton = () => {
    const theme = useColorScheme()
    const COLOR = theme === 'dark' ? 'white' : 'black'
    return (
        <TouchableOpacity onPress={() => router.back()} className='absolute top-10 left-4 rounded-full p-2 bg-input'>
            {Platform.OS === 'ios' ? <ChevronLeft color={COLOR} /> : <ArrowLeft color={COLOR} />}
        </TouchableOpacity>
    )
}

export default BackButton

