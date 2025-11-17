import { fetchRiderReviews } from '@/api/review';
import LoadingIndicator from '@/components/LoadingIndicator';
import ReviewCard from '@/components/ReviewCard';
import { useUserStore } from '@/store/userStore';
import { VendorReviewResponse } from '@/types/review-types';
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { FlatList, View } from 'react-native';

const riderReview = () => {
	const { riderId } = useLocalSearchParams()

	const { user } = useUserStore()
	const { data, isFetching, refetch } = useQuery({
		queryKey: ["riders", user?.sub, riderId],
		queryFn: () => fetchRiderReviews(riderId as string)
	})

	const renderItem = useCallback(({ item }: { item: VendorReviewResponse }) => <ReviewCard data={item} />, [data]);


	const keyExtractor = useCallback(
		(item: VendorReviewResponse, index: number) =>
			item.id ?? `review-${index}`,
		[]
	);

	const handleRefresh = useCallback(() => {
		refetch();
	}, [refetch]);



	if (isFetching) {
		return <LoadingIndicator />
	}

	return (
		<View className="flex-1 bg-background">
			<FlatList
				data={data || []}
				keyExtractor={keyExtractor}
				renderItem={renderItem}
				refreshing={isFetching}
				onRefresh={handleRefresh}
				scrollEventThrottle={16}
				showsVerticalScrollIndicator={false}
				removeClippedSubviews={true}
				maxToRenderPerBatch={10}
				windowSize={21}
				initialNumToRender={10}
			// getItemLayout={getItemLayout}
			/>



		</View>
	)
}

export default riderReview