import { CARD_BG } from '@/constants/theme'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const Card = ({ children, title, bordered = false }: { children: React.ReactNode, title?: string, bordered?: boolean }) => {
    return (
        <View style={{
            borderWidth: bordered ? StyleSheet.hairlineWidth : 0,
            borderColor: bordered ? CARD_BG : ''

        }} className='bg-input w-[95%] rounded-[15px] mb-1 overflow-hidden elevation-md self-center'>
            {title && <Text className='text-primary'>{title}</Text>}
            {children}
        </View>
    )
}



export default Card

const styles = StyleSheet.create({})