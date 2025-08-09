import { fetchCategories } from '@/api/item'
import { fetchProducts } from '@/api/product'
import Category from '@/components/Category'
import LoadingIndicator from '@/components/LoadingIndicator'
import ProductCard from '@/components/ProductCard'
import { useQuery } from '@tanstack/react-query'
import { router, Stack } from 'expo-router'
import React, { useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'


const MarketPlace = () => {

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data, isLoading, isPending } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    })

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        select: (categories) =>
            categories?.filter((category) => category.category_type === "product") || [],
    });


    if (isLoading || isPending) {
        <LoadingIndicator />
    }

    return (
        <View className='flex-1 bg-background'>
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
                    ListHeaderComponent={() => (
                        <>
                            <Category
                                categories={categories || []}
                                onCategorySelect={setSelectedCategory}
                                selectedCategory={selectedCategory}
                            />

                        </>
                    )}
                />

            </View>
        </View>
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