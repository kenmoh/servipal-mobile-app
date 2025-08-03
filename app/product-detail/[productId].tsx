import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const ProductDetail = () => {
    const { productId, name, imageUrls, price, seller } = useLocalSearchParams()
    const imageUrlsArray = JSON.parse(imageUrls)

    return (
        <View className='flex-1 bg-background'>
            <Text>ProductDetail</Text>
        </View>
    )
}

export default ProductDetail

const styles = StyleSheet.create({})