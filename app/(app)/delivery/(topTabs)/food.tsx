import { fetchUserRelatedOrders } from "@/api/order";
import HDivider from "@/components/HDivider";
import ItemCard from "@/components/ItemCard";
import { DeliveryListSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton";
import RefreshButton from "@/components/RefreshButton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useUserStore } from "@/store/userStore";
import { DeliveryDetail } from "@/types/order-types";
import { LegendList } from "@legendapp/list";
import { useQuery } from "@tanstack/react-query";
import {
    Check,
    ClockIcon,
    CoinsIcon,
    Handshake,
    Package,
    Package2,
    Shirt,
    Utensils,
} from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";

const UserOrders = () => {

    const { user } = useUserStore();

    const { data, isLoading, error, refetch, isFetching, isPending, isFetched } = useQuery({
        queryKey: ["orders", user?.sub],
        queryFn: () => fetchUserRelatedOrders(user?.sub as string),
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        enabled: !!user?.sub,
        staleTime: 30000,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });


    const stats = useMemo(
        () => ({
            pending:
                data?.filter((order) => order.delivery?.delivery_status === "pending")
                    .length || 0,
            acepted:
                data?.filter((order) => order.delivery?.delivery_status === "accepted")
                    .length || 0,
            received:
                data?.filter((order) => order.delivery?.delivery_status === "received")
                    .length || 0,
            delivered:
                data?.filter((order) => order.delivery?.delivery_status === "delivered")
                    .length || 0,
            foodOrders:
                data?.filter((order) => order.order.order_type === "food").length || 0,
            packageOrders:
                data?.filter((order) => order.order.order_type === "package").length ||
                0,
            laundryOrders:
                data?.filter((order) => order.order.order_type === "laundry").length ||
                0,
        }),
        [data]
    );

    // Memoized FlatList helpers
    const renderItem = useCallback(({ item }: { item: DeliveryDetail }) => <ItemCard data={item} />, []);
    const renderSeparator = useCallback(() => <HDivider />, []);
    const keyExtractor = useCallback((item: DeliveryDetail) => item?.order?.id!, []);

    if (isLoading || isFetching || isPending || !isFetched || !data) {
        return (
            <View className="bg-background flex-1 px-2" >
                <View
                    className="my-2 bg-background items-center justify-center h-[110px]"

                >
                    <StatsSkeleton />
                </View>
                <HDivider width="100%" />
                <View className="bg-background flex-1">
                    <DeliveryListSkeleton />
                </View>
            </View>
        );
    }

    if (error) return <RefreshButton onPress={refetch} label="Error loading orders" />

    return (
        <ErrorBoundary>
            <View className="bg-background flex-1 px-2">
                <View
                    className="my-2 bg-background items-center justify-center h-[110px]"
                >
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 10,
                            gap: 10,
                            paddingVertical: 10,
                            height: "100%",
                        }}
                    >
                        <StatCard
                            icon={CoinsIcon}
                            label="Total Orders"
                            value={data?.length || 0}
                            color={'gray'}
                        />
                        <StatCard
                            icon={Check}
                            label="Received"
                            value={stats.received}
                            color={"green"}
                        />
                        <StatCard
                            icon={ClockIcon}
                            label="Pending"
                            value={stats.pending}
                            color={"orange"}
                        />
                       
                        <StatCard
                            icon={Package2}
                            label="Delivered"
                            value={stats.delivered}
                            color={"lightblue"}
                        />
                                             
                    </ScrollView>
                </View>

                <HDivider width="100%" />

                <View className="bg-background flex-1">
                    <LegendList
                        data={data}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        ItemSeparatorComponent={renderSeparator}
                        refreshing={isFetching}
                        onRefresh={refetch}
                    />
                </View>
            </View>
        </ErrorBoundary>
    );
};

export default UserOrders;

const StatCard = React.memo(({ icon: Icon, label, value, color }: {
    icon: any;
    label: string;
    value: number;
    color: string;
}) => {
    const theme = useColorScheme();
    return (
        <View
            className="bg-input items-center justify-evenly py-2 mb-6 h-[90] w-[100] rounded-lg border border-collapse-transparent border-border-subtle border-rounded-lg"
        >
            <Icon size={24} color={color} />
            <View className="items-center">
                <Text style={{ fontSize: 20, fontWeight: '500', color: theme === 'dark' ? '#ddd' : '#000' }}>
                    {value}
                </Text>
                <Text style={{ fontSize: 12, color: theme === 'dark' ? '#888' : '#555' }}>
                    {label}
                </Text>
            </View>
        </View>
    )
});
StatCard.displayName = 'StatCard';
