import { Review } from '@/types/item-types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';

import { format } from 'date-fns';
import { Star } from 'lucide-react-native';
import { dummyReviews } from './dummyReviews';

const reviews = () => {
    const { reviews } = useLocalSearchParams();
    const vendorReviews = reviews ? JSON.parse(reviews as string) as Review[] : [];

    return (
        <View className='flex-1 bg-background'>
            <FlatList
                showsVerticalScrollIndicator={false}
                data={dummyReviews || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }: { item: Review }) => <ReviewCard data={item} />}
                contentContainerStyle={{ padding: 16 }}
            />
        </View>
    )
}

export default reviews

const ReviewCard = ({ data }: { data: Review }) => {
    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                size={10}
                // fill={index < rating ? "orange" : "transparent"}
                color={index < rating ? "orange" : "#D3D3D3"}
            />
        ));
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    return (
        <View

            className='bg-input py-2 px-3 w-full self-center rounded-lg mb-2'
        >

            <View className='flex-row items-center gap-3 mb-2'>

                <View className='rounded-full overflow-hidden h-10 w-10' >
                    <Image
                        source={{ uri: data.user.profile_image }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>
                <View className='flex-1'>
                    <View className='gap-2'>
                        <Text
                            className='font-poppins-medium text-sm text-primary'

                        >
                            {data.user.full_name}
                        </Text>

                    </View>
                    <Text className='text-xs text-primary' >
                        {formatDate(data.created_at)}
                    </Text>
                </View>
            </View>

            <View className='gap-2 mb-2 flex-row'>
                {renderStars(data.rating)}
            </View>

            <Text className='text-xs text-primary leading-5 font-poppins-medium'

            >
                {data.comment}
            </Text>

        </View>
    )
}