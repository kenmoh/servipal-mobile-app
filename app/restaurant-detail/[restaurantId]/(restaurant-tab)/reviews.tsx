import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';

import { fetchVendorReviews } from '@/api/review';
import ReviewCard from '@/components/ReviewCard';
import { VendorReviewResponse } from '@/types/review-types';
import { useQuery } from '@tanstack/react-query';


const reviews = () => {
    const { restaurantId } = useLocalSearchParams();

    const { data } = useQuery({
        queryKey: ['vendor-reviews', restaurantId],
        queryFn: () => fetchVendorReviews(restaurantId as string)
    })



    return (
        <View className='flex-1 bg-background'>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: VendorReviewResponse }) => <ReviewCard data={item} />}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    )
}

export default reviews

