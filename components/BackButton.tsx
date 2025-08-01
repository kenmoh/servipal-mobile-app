import { router } from 'expo-router'
import { ArrowLeft, ChevronLeft } from 'lucide-react-native'
import React from 'react'
import { Platform, StyleSheet, TouchableOpacity } from 'react-native'


const BackButton = () => {
    return (
        <TouchableOpacity onPress={() => router.back()} className='absolute top-10 left-6 rounded-full p-3 bg-input/10'>
            {Platform.OS === 'ios' ? <ChevronLeft /> : <ArrowLeft />}
        </TouchableOpacity>
    )
}

export default BackButton

const styles = StyleSheet.create({})