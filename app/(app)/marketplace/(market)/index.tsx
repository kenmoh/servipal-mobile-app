import { fetchCategories } from '@/api/item'
import { fetchProducts } from '@/api/product'
import Category from '@/components/Category'
import FAB from '@/components/FAB'
import LoadingIndicator from '@/components/LoadingIndicator'
import ProductCard from '@/components/ProductCard'
import GradientCard from '@/components/GradientCard'
import { useUserStore } from '@/store/userStore'
import { useQuery } from '@tanstack/react-query'
import { LinearGradient } from "expo-linear-gradient"
import { router } from 'expo-router'
import { Plus } from 'lucide-react-native'
import React, { useCallback, useState } from 'react'
import { FlatList, Text, View } from 'react-native'


const MarketPlace = () => {
    const { user } = useUserStore()
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
                           

                                <GradientCard label="Explore Peer-to-Peer Marketplace" description="Browse, buy, and sell items securely with confidence using our built-in escrow service. What you ordered is what you get! 😊"/>
                    
                        </>
                    )}
                    ListEmptyComponent={() => (
                        <View className="flex-1 justify-center items-center py-20">
                            <Text className="text-muted text-base font-poppins text-center">
                                {selectedCategory ? 'No products found in this category' : 'No products available'}
                            </Text>
                            <Text className="text-muted text-sm font-poppins-light text-center mt-2">
                                {selectedCategory ? 'Try selecting a different category' : 'Check back later for new products'}
                            </Text>
                        </View>
                    )}
                    refreshing={isFetching}
                    onRefresh={handleRefresh}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 10, alignItems: 'flex-start', justifyContent: 'center' }}

                />

            </View>
            {user?.user_type === 'laundry_vendor' || user?.user_type === 'restaurant_vendor' ? '' :
                <FAB icon={<Plus color={'white'} />} onPress={() => router.push('/product-detail/add-product')} />
            }
        </View>
    )
}

export default MarketPlace