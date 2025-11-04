import { fetchUserRelatedOrders } from "@/api/order";
import HDivider from "@/components/HDivider";
import DeliveryCard from "@/components/DeliveryCard";
import { DeliveryListSkeleton, StatsSkeleton } from "@/components/LoadingSkeleton";
import LoadingIndicator from '@/components/LoadingIndicator'
import RefreshButton from "@/components/RefreshButton";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useUserStore } from "@/store/userStore";
import { DeliveryDetail } from "@/types/order-types";
import { LegendList } from "@legendapp/list";
import { useQuery } from "@tanstack/react-query";
import { FlatList } from 'react-native';
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
    const theme = useColorScheme();

    const { data: allData, isLoading, error, refetch, isFetching, isPending } = useQuery({
        queryKey: ["user-orders", user?.sub],
        queryFn: () => fetchUserRelatedOrders(user?.sub as string),
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        enabled: !!user?.sub,
        staleTime: 0, // Changed from 30000 to 0 for immediate updates
        gcTime: 5 * 60 * 1000, // Keep data in cache for 5 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

   
    const data = useMemo(() => {
        return allData?.filter(item => item.order.order_type === 'package') || [];
    }, [allData]);

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
            packageOrders:
                data?.filter((order) => order.order.order_type === "package").length ||
                0,
        }),
        [data]
    );


const statItems = useMemo(() => {
  return [
    {
      id: 'total',
      icon: CoinsIcon,
      label: 'Total Orders',
      value: data?.length || 0,
      color: 'gray',
    },
    {
      id: 'received',
      icon: Check,
      label: 'Received',
      value: stats.received,
      color: 'green',
    },
    {
      id: 'assigned',
      icon: Handshake,
      label: 'Assigned',
      value: stats.acepted,
      color: 'blue',
    },
    {
      id: 'delivered',
      icon: Package2,
      label: 'Delivered',
      value: stats.delivered,
      color: 'lightblue',
    },
  ];
}, [data?.length, stats.received, stats.acepted, stats.delivered]);

    const renderItem = useCallback(({ item }: { item: DeliveryDetail }) => <DeliveryCard data={item} />, []);

    const keyExtractor = useCallback((item: DeliveryDetail) => item?.order?.id!, []);

    const ITEM_HEIGHT = 200;

    const getItemLayout = useCallback(
      (data: any, index: number) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      }),
      []
    );

    if (isLoading || isPending) return <LoadingIndicator/>

    if (error) return <RefreshButton onPress={refetch} label="Error loading orders" />

    return (
        <ErrorBoundary>
            <View className="bg-background flex-1 px-2">

                <View className="mt-2 bg-background items-center justify-center h-[110px]">
                <FlatList
                  data={statItems}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <StatCard
                      icon={item.icon}
                      label={item.label}
                      value={item.value}
                      color={item.color}
                    />
                  )}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{
                    paddingHorizontal: 10,
                    gap: 10,
                    paddingVertical: 10,

                  }}
                  removeClippedSubviews={true}
                  maxToRenderPerBatch={4}
                  windowSize={5}
                />
            </View>

                <HDivider width="100%" />
                <View className="mb-2" />

                <View className="bg-background flex-1">
                    <FlatList
                        data={data}
                        keyExtractor={keyExtractor}
                        renderItem={renderItem}
                        refreshing={isFetching}
                        onRefresh={refetch}
                        getItemLayout={getItemLayout}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={5}
                        windowSize={10}
                        initialNumToRender={5}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </ErrorBoundary>
    );
};

export default UserOrders;

// const StatCard = React.memo(({ icon: Icon, label, value, color, theme }: {
//   icon: any; label: string; value: number; color: string; theme: 'light' | 'dark'
// }) => {
//   return (
//     <View className="bg-input ...">
//       <Icon size={24} color={color} />
//       <Text style={{ color: theme === 'dark' ? '#ddd' : '#000' }}>{value}</Text>
//       <Text style={{ color: theme === 'dark' ? '#888' : '#555' }}>{label}</Text>
//     </View>
//   );
// });

const StatCard = React.memo(({ icon: Icon, label, value, color }: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) => {
  const theme = useColorScheme();
  return (
    <View className="bg-input items-center justify-evenly py-2 h-[90px] w-[100px] rounded-lg border border-border-subtle">
      <Icon size={24} color={color} />
      <Text style={{ fontSize: 20, fontWeight: '500', color: theme === 'dark' ? '#ddd' : '#000' }}>
        {value}
      </Text>
      <Text style={{ fontSize: 12, color: theme === 'dark' ? '#888' : '#555' }}>
        {label}
      </Text>
    </View>
  );
});

StatCard.displayName = 'StatCard';
// const StatCard = React.memo(({ icon: Icon, label, value, color }: {
//     icon: any;
//     label: string;
//     value: number;
//     color: string;
// }) => {
//     const theme = useColorScheme();
//     return (
//         <View
//             className="bg-input items-center justify-evenly py-2 mb-6 h-[90] w-[100] rounded-lg border border-collapse-transparent border-border-subtle border-rounded-lg"
//         >
//             <Icon size={24} color={color} />
//             <View className="items-center">
//                 <Text style={{ fontSize: 20, fontWeight: '500', color: theme === 'dark' ? '#ddd' : '#000' }}>
//                     {value}
//                 </Text>
//                 <Text style={{ fontSize: 12, color: theme === 'dark' ? '#888' : '#555' }}>
//                     {label}
//                 </Text>
//             </View>
//         </View>
//     )
// });
// StatCard.displayName = 'StatCard';