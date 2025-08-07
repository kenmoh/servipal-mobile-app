import { fetchProducts } from '@/api/product'
import ProductCard from '@/components/ProductCard'
import { useQuery } from '@tanstack/react-query'
import { router, Stack } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'


const MarketPlace = () => {

    const { data, isLoading, isPending } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    })

    if (isLoading || isPending) {
        <View className='flex-1 justify-center items-center bg-background'>

            <ActivityIndicator color={'gray'} size={'large'} />
        </View>
    }

    return (
        <>
            <Stack.Screen options={{
                headerRight: () => <AddProductBtn onPress={() =>
                    router.push('/marketplace/add-product')
                } />

            }} />
            <View className='flex-1 bg-background'>
                <FlatList
                    data={data || []}
                    renderItem={({ item }) => <ProductCard product={item} />}
                    keyExtractor={(item) => item?.id}
                />

            </View>
        </>
    )
}

export default MarketPlace

const styles = StyleSheet.create({})


const AddProductBtn = ({ onPress }: { onPress: () => void }) => {
    return (
        <TouchableOpacity onPress={onPress} className='rounded-full py-2 px-4 bg-button-primary'>
            <Text className='text-white text-center'>Add Product</Text>
        </TouchableOpacity>
    )
}