import { fetchProductReviews } from '@/api/review'
import EmptyList from '@/components/EmptyList'
import LoadingIndicator from '@/components/LoadingIndicator'
import ReviewCard from '@/components/ReviewCard'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { FlatList, View } from 'react-native'

const ProductReviews = () => {
    const { productId } = useLocalSearchParams<{ productId: string }>()

    const { data, isLoading, isPending, isFetching, refetch } = useQuery({
        queryKey: ['product-reviews', productId],
        queryFn: () => fetchProductReviews(productId),

    })


    if (isLoading || isPending || isFetching) {
        return <View className='flex-1 bg-background p-5'>
            <LoadingIndicator />
        </View>
    }


    return (
        <View className='flex-1 bg-background p-5'>

            <FlatList
                data={data || []}
                renderItem={({ item }) => <ReviewCard data={item} />}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={<EmptyList title='No reviews found' description='Be the first to review this product' />}


            />
        </View>
    )
}

export default ProductReviews