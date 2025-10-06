import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme';
import { ChevronDown } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export interface CategoryType {
    id: string;
    name: string;
    category_type: string;
}

export interface CategoryProps {
    categories: CategoryType[];
    onCategorySelect: (categoryId: string | null) => void;
    selectedCategory: string | null;
}

const Category = ({ categories, onCategorySelect, selectedCategory }: CategoryProps) => {
    const theme = useColorScheme();

    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT;
    const HANDLE_COLOR = theme === 'dark' ? HEADER_BG_LIGHT : HEADER_BG_DARK;

    const BORDER_COLOR = '#2f4550'


    const scrollViewRef = useRef<ScrollView>(null);
    const categoryRefs = useRef<{ [key: string]: View | null }>({});
    const [modalVisible, setModalVisible] = useState(false);

    const handlePresentModal = () => {
        setModalVisible(true);
    };

    // Get first 3 categories
    const displayedCategories = categories.slice(0, 2);

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

    const handleModalCategorySelect = useCallback((categoryId: string) => {
        onCategorySelect(categoryId);
        setModalVisible(false);
        
        // Scroll to the More button to show the selected category
        setTimeout(() => {
            const moreRef = categoryRefs.current['more'];
            if (moreRef && scrollViewRef.current) {
                moreRef.measure((x, y, width, height, pageX, pageY) => {
                    scrollViewRef.current?.scrollTo({ x: Math.max(0, pageX - 20), animated: true });
                });
            }
        }, 100);
    }, [onCategorySelect]);

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
                        backgroundColor: isSelected ? 'orange' : BG_COLOR,
                        borderColor: isSelected ? 'orange' : BORDER_COLOR,
                    },
                ]}
            >
                <Text
                    className={`${isSelected ? 'white' : 'text-primary'} text-sm font-poppins-medium`}


                >
                    {item.name}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[styles.scrollContainer, { backgroundColor: BG_COLOR }]}
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
                                    backgroundColor: selectedCategory === null ? 'orange' : BG_COLOR,
                                    borderColor: selectedCategory === null ? 'orange' : BORDER_COLOR,
                                },
                            ]}
                        >
                            <Text
                                className={`${selectedCategory === null ? 'white' : 'text-primary'} text-sm ${selectedCategory === null ? 'font-poppins-medium' : 'font-poppins'}`}

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

                {categories.length > 4 && (
                    <View
                        ref={ref => categoryRefs.current['more'] = ref}
                        collapsable={false}
                    >
                        <TouchableOpacity
                            onPress={handlePresentModal}
                            style={[
                                styles.categoryItem,
                                {
                                    backgroundColor: BG_COLOR,
                                    borderColor: BORDER_COLOR,
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
            <Modal
                visible={modalVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={[styles.modalContainer, { backgroundColor: BG_COLOR }]}>
                    <View style={styles.modalHeader}>
                        <Text className='text-primary font-poppins-medium text-lg'>
                            All Categories
                        </Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className='text-primary font-poppins'>Done</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView style={styles.modalContent}>
                        <View style={styles.modalCategoriesContainer}>
                            {categories.map((item) => (
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
                    </ScrollView>
                </View>
            </Modal>

        </View>
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
    modalContainer: {
        flex: 1,
        paddingTop: 50,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2f4550',
    },
    modalContent: {
        flex: 1,
        padding: 16,
    },
    modalCategoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modalCategoryItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
    },
});

export default Category;