import { Review } from '@/types/item-types';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, Image, Text, View } from 'react-native';

import Card from '@/components/Card';
import { format } from 'date-fns';
import { CheckCircle2, Star } from 'lucide-react-native';
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
                size={16}
                fill={index < rating ? "#FFD700" : "transparent"}
                color={index < rating ? "#FFD700" : "#D3D3D3"}
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
        <Card
        // marginVertical={'$2'}
        // backgroundColor={'$cardBackground'}
        // borderWidth={StyleSheet.hairlineWidth}
        // borderColor={'$borderColor'}
        // borderRadius={'$4'}
        >

            <View className='flex-row items-center gap-3 mb-2'>

                <View className='rounded-full overflow-hidden h-10 w-10' >
                    <Image
                        source={{ uri: data.user.profile_image }}
                        style={{ width: '100%', height: '100%' }}
                    />
                </View>
                <View className='flex-1'>
                    <View className='flex-row  items-center gap-2'>
                        <Text
                            className='font-poppins-medium text-sm text-primary'

                        >
                            {data.user.full_name}
                        </Text>
                        <CheckCircle2 size={16} color="#4CAF50" />
                    </View>
                    <Text className='text-xs text-primary' >
                        {formatDate(data.created_at)}
                    </Text>
                </View>
            </View>

            <View className='gap-1 mb-2'>
                {renderStars(data.rating)}
            </View>

            <Text className='text-xs text-primary leading-5 font-poppins-medium'

            >
                {data.comment}
            </Text>

        </Card>
    )
}