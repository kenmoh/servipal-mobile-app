import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, View } from 'react-native';

import { fetchVendorReviews } from '@/api/review';
import ReviewCard from '@/components/ReviewCard';
import { VendorReviewResponse } from '@/types/review-types';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from "@/context/authContext";


const reviews = () => {
    const { storeId } = useAuth();

    const { data } = useQuery({
        queryKey: ['vendor-reviews', storeId],
        queryFn: () => fetchVendorReviews('88c6f04b-fa17-4f20-8404-d570d131bea0')
    })

    console.log(storeId)

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

