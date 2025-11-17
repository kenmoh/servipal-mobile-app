import { fetchVendorReviews } from '@/api/review';
import LoadingIndicator from '@/components/LoadingIndicator';
import ReviewCard from '@/components/ReviewCard';
import { VendorReviewResponse } from '@/types/review-types';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import { CheckCircle2, Star } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';

const reviews = () => {
    const { laundryId } = useLocalSearchParams();
    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['vendor-reviews', laundryId],
        queryFn: () => fetchVendorReviews(laundryId as string)
    })


    if (isFetching || isLoading) {
        return <LoadingIndicator />
    }


    return (
        <View className='flex-1 bg-background'>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: VendorReviewResponse }) => <ReviewCard data={item} />}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className='bg-background flex-1 justify-center items-center'>
                        <Text className='text-muted font-poppins-semibold text-xl'>No Reviews Yet</Text>
                    </View>

                }
            />

        </View>
    )
}

export default reviews

