import { fetUserOrders } from '@/api/marketplace'
import EmptyList from '@/components/EmptyList'
import LoadingIndicator from '@/components/LoadingIndicator'
import ProductOrderCard from '@/components/ProductOrderCard'
import { useAuth } from '@/context/authContext'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import { FlatList, View } from 'react-native'

const orders = () => {
    const { user } = useAuth()

    const { data, isLoading, isPending } = useQuery({
        queryKey: ['products', user?.sub],
        queryFn: () => fetUserOrders(user?.sub as string),
        enabled: !!user?.sub
    })


    if (isLoading || isPending) {
        return <LoadingIndicator />
    }



    if (!data || data.length === 0) {
        return (
            <EmptyList
                title="No Products Found"
                description="You haven't added any products yet. Add your first product to get started!"
                buttonTitle="Add Product"
                route="/marketplace/add-product"
            />
        )
    }

    return (
        <View className='flex-1 bg-background'>
            <FlatList
                data={data}
                renderItem={({ item }) => <ProductOrderCard data={item} />}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={{

                    alignSelf: 'center',
                    gap: '5%'
                }}


            />
        </View>
    )
}

export default orders

