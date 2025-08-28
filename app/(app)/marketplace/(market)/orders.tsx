import { fetUserOrders } from '@/api/marketplace'
import EmptyList from '@/components/EmptyList'
import LoadingIndicator from '@/components/LoadingIndicator'
import ProductOrderCard from '@/components/ProductOrderCard'
import StatCard from '@/components/StatCard'
import { useAuth } from '@/context/authContext'
import { useQuery } from '@tanstack/react-query'
import { useFocusEffect } from 'expo-router'
import { Check, ClockIcon, CoinsIcon, X } from 'lucide-react-native'
import React, { useCallback, useMemo } from 'react'
import { FlatList, ScrollView, View } from 'react-native'

const orders = () => {
    const { user } = useAuth()

    const { data, isLoading, isPending, refetch, isFetching, isFetched } = useQuery({
        queryKey: ['products', user?.sub],
        queryFn: () => fetUserOrders(user?.sub as string),
        enabled: !!user?.sub
    })

    useFocusEffect(useCallback(() => {
        refetch()
    }, []))



    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);



    if (isLoading || isPending || isFetching) {
        return <LoadingIndicator />
    }

    const stats = useMemo(
        () => ({
            pending:
                data?.filter((order) => order?.order_status === "pending")
                    .length || 0,

            received:
                data?.filter((order) => order.order_status === "received")
                    .length || 0,
            delivered:
                data?.filter((order) => order?.order_status === "delivered")
                    .length || 0,
            cancelled:
                data?.filter((order) => order?.order_status === "cancelled")
                    .length || 0,


        }),
        [data]
    );




    if (isFetched && data?.length === 0) {
        return (
            <EmptyList
                title="No Products Found"
                description="You haven't added any products yet. Add your first product to get started!"
                buttonTitle="Add Product"
                route="/marketplace/add-product"
            />
        )
    }

    const HeaderStatCard = () => {
        return (<View
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
                    label="Completed"
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
                    icon={X}
                    label="Cancelled"
                    value={stats.cancelled}
                    color={"red"}
                />


            </ScrollView>
        </View>)
    }

    return (
        <View className='flex-1 bg-background'>
            <FlatList
                data={data}
                renderItem={({ item }) => <ProductOrderCard data={item} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{

                    // alignSelf: 'center',
                    gap: '5%'
                }}

                refreshing={isFetching}
                onRefresh={handleRefresh}
                ListHeaderComponent={<HeaderStatCard />}


            />
        </View>
    )
}

export default orders

