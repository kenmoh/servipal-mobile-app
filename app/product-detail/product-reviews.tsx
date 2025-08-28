import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const ProductReviews = () => {
    const { productId } = useLocalSearchParams<{ productId: string }>()

    return (
        <View className='flex-1 bg-background justify-center items-center'>
            <Text className='text-lg text-primary font-bold'>Product Reviews for {productId}</Text>
        </View>
    )
}

export default ProductReviews