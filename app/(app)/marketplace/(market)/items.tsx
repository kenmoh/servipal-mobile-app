import { fetchUserProducts } from '@/api/product'
import EmptyList from '@/components/EmptyList'
import FAB from '@/components/FAB'
import LoadingIndicator from '@/components/LoadingIndicator'
import ProductItemCard from '@/components/ProductItemCard'
import { useAuth } from '@/context/authContext'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Plus } from 'lucide-react-native'
import React from 'react'
import { FlatList, StyleSheet, View } from 'react-native'

const items = () => {
    const { user } = useAuth()

    const { data, isLoading, isPending } = useQuery({
        queryKey: ['user-products', user?.sub],
        queryFn: () => fetchUserProducts(user?.sub as string),
        enabled: !!user?.sub
    })

    if (isLoading || isPending) {
        return <LoadingIndicator />
    }
    console.log(data, "Producct")




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
                data={data || []}
                keyExtractor={(item) => item?.id}
                renderItem={({ item }) => <ProductItemCard item={item} />}
                numColumns={2}
                columnWrapperStyle={{
                    alignSelf: 'center',
                    gap: '5%'
                }}


            />
            <FAB icon={<Plus color={'white'} />} onPress={() => router.push('/product-detail/add-product')} />
        </View>
    )
}

export default items

const styles = StyleSheet.create({})