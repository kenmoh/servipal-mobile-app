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
import React, { useCallback, useState, useRef } from 'react'
import { FlatList, Text, View, useColorScheme, StyleSheet, TouchableOpacity } from 'react-native'
import RefreshButton from "@/components/RefreshButton";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';


const MarketPlace = () => {
    const { user } = useUserStore()
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const theme = useColorScheme();
    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT;
    const HANDLE_INDICATOR_STYLE = theme === "dark" ? HEADER_BG_LIGHT : HEADER_BG_DARK;
    const HANDLE_STYLE = theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;
    const BORDER_COLOR = '#2f4550';
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { data, isLoading, isPending, isFetching, refetch } = useQuery({
        queryKey: ['products', selectedCategory],
        queryFn: () => {
            const categoryParam = selectedCategory === null ? undefined : selectedCategory;
            return fetchProducts(categoryParam);
        }
    })

      const handleModalCategorySelect = useCallback((categoryId: string) => {
        setSelectedCategory(categoryId);
        bottomSheetRef.current?.close();
    }, []);

        const openBottomSheet = useCallback(() => {
        bottomSheetRef.current?.expand();
    }, []);

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
                                onOpenSheet={openBottomSheet}
                            />
                           

                               { data?.length === 0 && <GradientCard label="Explore Peer-to-Peer Marketplace" description="Browse, buy, and sell items securely with confidence using our built-in escrow service. What you ordered is what you get! 😊"/>}
                    
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

            <BottomSheet
                index={-1}
                snapPoints={['35%', '65%']}
                ref={bottomSheetRef}
                enablePanDownToClose={true}
                enableDynamicSizing={true}
                handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }}
                handleStyle={{ backgroundColor: HANDLE_STYLE }}
                backgroundStyle={{
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    backgroundColor: BG_COLOR,
                    shadowColor: 'orange',
                    shadowOffset: {
                        width: 0,
                        height: -4
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 20
                }}
            >
                <BottomSheetScrollView style={{ backgroundColor: BG_COLOR, paddingHorizontal: 16, flex: 1, paddingBottom: 20}}>
                    <View style={styles.modalCategoriesContainer}>
                        {categories?.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => handleModalCategorySelect(item.id)}
                                style={[
                                    styles.modalCategoryItem,
                                    {
                                        backgroundColor: selectedCategory === item.id ? 'orange' : BG_COLOR,
                                        borderColor: selectedCategory === item.id ? 'orange' : BORDER_COLOR,
                                    },
                                ]}
                            >
                                <Text
                                    className={`${selectedCategory === item.id ? 'text-white' : 'text-primary'} ${selectedCategory === item.id ? 'font-poppins-medium' : 'font-poppins-light'} text-sm`}
                                >
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </BottomSheetScrollView>
            </BottomSheet>
        </View>
    )
}

export default MarketPlace


const styles = StyleSheet.create({
    image: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    modalCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'flex-start',
    },
    modalCategoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
});