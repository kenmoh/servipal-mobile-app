import { buyItem, fetchProduct } from '@/api/product'
import AppVariantButton from '@/components/core/AppVariantButton'
import ProductDetailWrapper from '@/components/ProductDetailWrapper'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native'

const ProductDetail = () => {
    const { productId } = useLocalSearchParams<{ productId: string }>()
    const [selectedColor, setSelectedColor] = useState<string>('')
    const [selectedSize, setSelectedSize] = useState<string>('')
    const [quantity, setQuantity] = useState(1)
    const [additionalInfo, setAdditionalInfo] = useState('')

    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => fetchProduct(productId!),
        enabled: !!productId,
    })




    const buyMutation = useMutation({
        mutationFn: (data: any) => buyItem(productId!, data),
        onSuccess: () => {
            Alert.alert('Success', 'Product purchased successfully!')
            router.back()
        },
        onError: (error) => {
            Alert.alert('Error', error.message || 'Failed to purchase product')
        }
    })

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size={'large'} color={'gray'} />
            </View>
        )
    }

    if (!product) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-sm text-foreground">Product not found</Text>
            </View>
        )
    }

    const handleBuy = () => {
        if (!selectedSize && product.sizes) {
            Alert.alert('Error', 'Please select a size')
            return
        }

        const buyData = {
            quantity,
            colors: selectedColor ? [selectedColor] : undefined,
            sizes: selectedSize,
            additional_info: additionalInfo
        }

        buyMutation.mutate(buyData)
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(price)
    }

    return (
        <ProductDetailWrapper images={product.images}>
            <View className="flex-1 px-6 space-y-6">
                {/* Title and Price */}
                <View className="space-y-2">
                    <Text className="text-2xl font-bold text-primary font-poppins-bold">{product.name}</Text>
                    <Text className="text-3xl font-bold text-primary">{formatPrice(product.price)}</Text>
                    <Text className="text-sm text-muted-foreground">
                        {product.total_sold} sold • In stock: {product.stock}
                    </Text>
                </View>


                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <View className="space-y-3 my-2">
                        <Text className="text-sm font-semibold text-primary font-poppins">Colors</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {product.colors.map((color, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedColor(selectedColor === color ? '' : color)}
                                    className={`w-10 h-10 rounded-full border-2 ${selectedColor === color
                                        ? 'border-primary'
                                        : 'border-gray-300'
                                        }`}
                                    style={{ backgroundColor: color }}
                                >
                                    {selectedColor === color && (
                                        <View className="flex-1 justify-center items-center">
                                            <Ionicons name="checkmark" size={20} color="orange" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Sizes */}
                {product.sizes && (
                    <View className="space-y-3 my-2">
                        <Text className="text-sm font-semibold text-primary font-poppins">Sizes</Text>
                        <View className="flex-row flex-wrap gap-3">
                            {product.sizes.split(',').map((size, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => setSelectedSize(selectedSize === size.trim() ? '' : size.trim())}
                                    className={`h-8 w-8 justify-center items-center rounded-lg border-[1px] ${selectedSize === size.trim()
                                        ? 'border-primary bg-orange-500'
                                        : 'border-gray-300 bg-transparent'
                                        }`}
                                >
                                    <Text className={`font-medium ${selectedSize === size.trim()
                                        ? 'text-white'
                                        : 'text-orange-400'
                                        }`}>
                                        {size.trim()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Quantity */}
                <View className="space-y-3">
                    <Text className="text-sm font-semibold text-primary font-poppins my-2">Quantity</Text>
                    <View className="flex-row items-center space-x-4">
                        <TouchableOpacity
                            onPress={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-8 h-8 rounded-lg border border-gray-300 justify-center items-center"
                        >
                            <Ionicons name="remove" size={20} color="gray" />
                        </TouchableOpacity>
                        <Text className="text-xl font-semibold text-primary min-w-[40px] text-center">
                            {quantity}
                        </Text>
                        <TouchableOpacity
                            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
                            className="w-8 h-8 rounded-lg border border-gray-300 justify-center items-center"
                        >
                            <Ionicons name="add" size={20} color="gray" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Description */}
                <View className="space-y-2 my-4">
                    <Text className="text-sm font-semibold text-primary font-poppins">Description</Text>
                    <Text className="text-base text-muted font-poppins-light leading-6">{product.description}</Text>
                </View>

                {/* Additional Information */}
                <View className="space-y-3 my-3">
                    <Text className="text-sm font-semibold text-primary font-poppins">Additional Information</Text>
                    <TextInput
                        value={additionalInfo}
                        onChangeText={setAdditionalInfo}
                        placeholder="Any special requests or notes..."
                        multiline
                        numberOfLines={3}
                        className="p-3 focus:border focus:border-orange-300 rounded-lg text-primary font-poppins bg-input"
                        placeholderTextColor="#666"
                    />
                </View>

                {/* Total Price */}
                <View className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg my-4">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-primary font-poppins-bold">Total</Text>
                        <Text className="text-2xl bg-orange-800/25 text-orange-500 font-bold rounded-lg px-3 py-2 text-center">
                            {formatPrice(product.price * quantity)}
                        </Text>
                    </View>
                </View>

                {/* Buy Button */}
                <View className="pb-6 mb-6">
                    <AppVariantButton
                        label={buyMutation.isPending ? "Processing..." : "Buy Now"}
                        onPress={handleBuy}
                        disabled={buyMutation.isPending}
                    />
                </View>
            </View>
        </ProductDetailWrapper>
    )
}

export default ProductDetail
