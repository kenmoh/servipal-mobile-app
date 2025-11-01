import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme';
import { ChevronDown } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export interface CategoryType {
    id: string;
    name: string;
    category_type: string;
}

export interface CategoryProps {
    categories: CategoryType[];
    onCategorySelect: (categoryId: string | null) => void;
    selectedCategory: string | null;
    onOpenSheet: () => void;
}

const Category = ({ categories, onCategorySelect, selectedCategory, onOpenSheet }: CategoryProps) => {
    const theme = useColorScheme();

    // Memoize theme-dependent values
    const themeColors = useMemo(() => ({
        BG_COLOR: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
        BORDER_COLOR: '#2f4550'
    }), [theme]);

    const scrollViewRef = useRef<ScrollView>(null);
    const categoryRefs = useRef<{ [key: string]: View | null }>({});

    const scrollToCategory = useCallback((categoryId: string | null) => {
        const ref = categoryId === null ? categoryRefs.current['all'] : categoryRefs.current[categoryId];
        if (ref && scrollViewRef.current) {
            ref.measure((x, y, width, height, pageX, pageY) => {
                scrollViewRef.current?.scrollTo({ x: Math.max(0, pageX - 20), animated: true });
            });
        }
    }, []);

    const handleCategoryPress = useCallback((categoryId: string | null) => {
        onCategorySelect(categoryId);
        scrollToCategory(categoryId);
    }, [onCategorySelect, scrollToCategory]);

    const handleMorePress = useCallback(() => {
        onOpenSheet();
        
        // Scroll to the More button after opening sheet
        setTimeout(() => {
            const moreRef = categoryRefs.current['more'];
            if (moreRef && scrollViewRef.current) {
                moreRef.measure((x, y, width, height, pageX, pageY) => {
                    scrollViewRef.current?.scrollTo({ x: Math.max(0, pageX - 20), animated: true });
                });
            }
        }, 100);
    }, [onOpenSheet]);

    const CategoryItem = ({ item, isSelected }: { item: CategoryType; isSelected: boolean }) => (
        <View
            ref={ref => categoryRefs.current[item.id] = ref}
            collapsable={false}
        >
            <TouchableOpacity
                onPress={() => handleCategoryPress(item.id)}
                style={[
                    styles.categoryItem,
                    {
                        backgroundColor: isSelected ? 'orange' : themeColors.BG_COLOR,
                        borderColor: isSelected ? 'orange' : themeColors.BORDER_COLOR,
                    },
                ]}
            >
                <Text
                    className={`${isSelected ? 'text-white' : 'text-primary'} text-sm font-poppins-medium`}
                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContainer, { backgroundColor: themeColors.BG_COLOR }]}
        >
            {categories.length > 4 && (
                <View
                    ref={ref => categoryRefs.current['all'] = ref}
                    collapsable={false}
                >
                    <TouchableOpacity
                        onPress={() => handleCategoryPress(null)}
                        style={[
                            styles.categoryItem,
                            {
                                backgroundColor: selectedCategory === null ? 'orange' : themeColors.BG_COLOR,
                                borderColor: selectedCategory === null ? 'orange' : themeColors.BORDER_COLOR,
                            },
                        ]}
                    >
                        <Text
                            className={`${selectedCategory === null ? 'text-white' : 'text-primary'} text-sm ${selectedCategory === null ? 'font-poppins-medium' : 'font-poppins'}`}
                        >
                            All
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {(categories.length > 4 ? categories.slice(0, 2) : categories).map((category) => (
                <CategoryItem
                    key={category.id}
                    item={category}
                    isSelected={selectedCategory === category.id}
                />
            ))}

            {categories.length > 5 && (
                <View
                    ref={ref => categoryRefs.current['more'] = ref}
                    collapsable={false}
                >
                    <TouchableOpacity
                        onPress={handleMorePress}
                        style={[
                            styles.categoryItem,
                            {
                                backgroundColor: themeColors.BG_COLOR,
                                borderColor: themeColors.BORDER_COLOR,
                            },
                        ]}
                    >
                        <View className='flex-row items-center gap-1' >
                            <Text className='text-primary text-sm'>
                                {selectedCategory && !categories.slice(0, 2).some(cat => cat.id === selectedCategory)
                                    ? categories.find(cat => cat.id === selectedCategory)?.name
                                    : 'More'
                                }
                            </Text>
                            <ChevronDown size={16} color={theme === 'dark' ? 'white' : 'black'} />
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    categoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginRight: 8,
    },
});

export default Category;