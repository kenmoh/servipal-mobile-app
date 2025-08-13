import { fetchCategories } from '@/api/item'
import { fetchProducts } from '@/api/product'
import Category from '@/components/Category'
import FAB from '@/components/FAB'
import LoadingIndicator from '@/components/LoadingIndicator'
import ProductCard from '@/components/ProductCard'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { Plus } from 'lucide-react-native'
import React, { useCallback, useState } from 'react'
import { FlatList, Text, View } from 'react-native'


const MarketPlace = () => {

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const { data, isLoading, isPending, isFetching, refetch } = useQuery({
        queryKey: ['products', selectedCategory],
        queryFn: () => {
            const categoryParam = selectedCategory === null ? undefined : selectedCategory;
            return fetchProducts(categoryParam);
        }
    })

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: fetchCategories,
        select: (categories) =>
            categories?.filter((category) => category.category_type === "product") || [],
    });



    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);




    if (isLoading || isPending) {
        return <LoadingIndicator />
    }

    return (
        <View className='flex-1 bg-background'>

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
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center py-20">
                            <Text className="text-muted text-base font-poppins text-center">
                                {selectedCategory ? 'No products found in this category' : 'No products available'}
                            </Text>
                            <Text className="text-muted-foreground text-sm font-poppins-light text-center mt-2">
                                {selectedCategory ? 'Try selecting a different category' : 'Check back later for new products'}
                            </Text>
                        </View>
                    )}
                    refreshing={isFetching}
                    onRefresh={handleRefresh}
                />

            </View>
            <FAB icon={<Plus color={'white'} />} onPress={() => router.push('/product-detail/add-product')} />
        </View>
    )
}

export default MarketPlace