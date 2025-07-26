import React, { useEffect } from 'react';
import { DimensionValue, StyleSheet, View } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';


interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    marginVertical?: number;
    marginHorizontal?: number;
}

const SkeletonItem: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius = 8,
    marginVertical = 4,
    marginHorizontal = 0,
}) => {

    const shimmerValue = useSharedValue(0);

    useEffect(() => {
        shimmerValue.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            shimmerValue.value,
            [0, 0.5, 1],
            [0.5, 0.9, 0.5]
        );

        return {
            opacity,
        };
    });

    return (
        <Animated.View
            className='bg-profile-card'
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius,
                    marginVertical,
                    marginHorizontal,

                },
                animatedStyle,
            ]}
        />
    );
};

// Item Card Skeleton
export const ItemCardSkeleton: React.FC = () => {


    return (
        <View className='bg-profile-card' style={[styles.cardContainer]}>
            <View style={styles.cardHeader}>
                <SkeletonItem width={50} height={50} borderRadius={25} />
                <View style={styles.headerContent}>
                    <SkeletonItem width="70%" height={14} />
                    <SkeletonItem width="50%" height={12} marginVertical={6} />
                    <SkeletonItem width="40%" height={10} />
                </View>
            </View>

            <View style={styles.cardBody}>
                <SkeletonItem width="100%" height={12} marginVertical={3} />
                <SkeletonItem width="90%" height={12} marginVertical={3} />
                <SkeletonItem width="80%" height={12} marginVertical={3} />
            </View>

            <View style={styles.cardFooter}>
                <SkeletonItem width={70} height={28} borderRadius={14} />
                <SkeletonItem width={50} height={28} borderRadius={14} />
            </View>
        </View>
    );
};

// Stat Card Skeleton
export const StatCardSkeleton: React.FC = () => {


    return (
        <View className='bg-profile-card' style={[styles.statCard,]}>
            <SkeletonItem width={24} height={24} borderRadius={12} />
            <View style={styles.statContent}>
                <SkeletonItem width={30} height={18} />
                <SkeletonItem width={50} height={11} marginVertical={4} />
            </View>
        </View>
    );
};

// Search Bar Skeleton
export const SearchBarSkeleton: React.FC = () => {
    return <SkeletonItem width="100%" height={40} borderRadius={20} marginVertical={8} />;
};

// Horizontal Stats Skeleton
export const StatsSkeleton: React.FC = () => {
    return (
        <View style={styles.statsContainer}>
            {Array.from({ length: 8 }).map((_, index) => (
                <StatCardSkeleton key={index} />
            ))}
        </View>
    );
};

// Delivery List Skeleton
export const DeliveryListSkeleton: React.FC = () => {
    return (
        <View style={styles.listContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
                <ItemCardSkeleton key={index} />
            ))}
        </View>
    );
};

// Restaurant/Laundry Card Skeleton
export const StoreCardSkeleton: React.FC = () => {

    return (
        <View className='bg-profile-card' style={[styles.storeCard,]}>
            <SkeletonItem width={80} height={80} borderRadius={8} />
            <View style={styles.storeContent}>
                <SkeletonItem width="70%" height={16} />
                <SkeletonItem width="50%" height={12} marginVertical={6} />
                <SkeletonItem width="40%" height={12} marginVertical={4} />
                <SkeletonItem width="30%" height={10} />
            </View>
            <View style={styles.storeRating}>
                <SkeletonItem width={40} height={20} borderRadius={10} />
            </View>
        </View>
    );
};

// Featured Swiper Skeleton
export const FeaturedSwiperSkeleton: React.FC = () => {


    return (
        <View style={styles.swiperContainer}>
            {Array.from({ length: 3 }).map((_, index) => (
                <View key={index} style={styles.swiperCard}>
                    <SkeletonItem width="100%" height={160} borderRadius={12} />
                    <View style={styles.swiperOverlay}>
                        <SkeletonItem width="80%" height={14} />
                        <SkeletonItem width="60%" height={12} marginVertical={6} />
                    </View>
                </View>
            ))}
        </View>
    );
};

// Category Skeleton
export const CategorySkeleton: React.FC = () => {
    return (
        <View style={styles.categoryContainer}>
            {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.categoryItem}>
                    <SkeletonItem width={50} height={50} borderRadius={25} />
                    <SkeletonItem width={60} height={10} marginVertical={4} />
                </View>
            ))}
        </View>
    );
};

// Food/Laundry List Skeleton
export const StoreListSkeleton: React.FC = () => {
    return (
        <View style={styles.listContainer}>
            <CategorySkeleton />
            <FeaturedSwiperSkeleton />
            {Array.from({ length: 8 }).map((_, index) => (
                <StoreCardSkeleton key={index} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    cardContainer: {
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerContent: {
        flex: 1,
        marginLeft: 10,
    },
    cardBody: {
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    statCard: {
        width: 100,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 5,
        padding: 8,
    },
    statContent: {
        alignItems: 'center',
        marginTop: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
        height: 110,
    },
    listContainer: {
        flex: 1,
    },
    storeCard: {
        flexDirection: 'row',
        padding: 12,
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: 12,
        alignItems: 'center',
    },
    storeContent: {
        flex: 1,
        marginLeft: 12,
    },
    storeRating: {
        alignItems: 'flex-end',
    },
    swiperContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    swiperCard: {
        width: '90%',
        marginHorizontal: 8,
        position: 'relative',
    },
    swiperOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    categoryItem: {
        alignItems: 'center',
        width: 60,
    },
});

export default SkeletonItem; 