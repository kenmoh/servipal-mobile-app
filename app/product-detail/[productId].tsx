import { buyItem, fetchProduct } from '@/api/product'
import AppVariantButton from '@/components/core/AppVariantButton'
import ProductDetailWrapper from '@/components/ProductDetailWrapper'
import { usePurchaseActions, usePurchaseSelectors } from '@/store/productStore'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native'


const ProductDetail = () => {
    const { productId } = useLocalSearchParams<{ productId: string }>()
    const {
        setProduct,
        clearProduct,

        incrementQuantity,
        decrementQuantity,
        toggleColor,
        toggleSize,
        clearColors,
        clearSizes,
        setAllColors,
        setAllSizes,

        validatePurchase
    } = usePurchaseActions()

    const {
        product,
        quantity,
        selectedSizes,
        selectedColors,
        availableSizes,
        totalPrice,
        isLoading: storeLoading,
        error: storeError
    } = usePurchaseSelectors()



    const { data, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => fetchProduct(productId!),
        enabled: !!productId,
    })


    useEffect(() => {
        if (data) {
            setProduct(data)
        }

        // Cleanup when component unmounts
        return () => {
            clearProduct()
        }
    }, [data, setProduct, clearProduct])


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


    const isColorSelected = (color: string) => selectedColors.includes(color)
    const isSizeSelected = (size: string) => selectedSizes.includes(size)


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

    const handleContinueToPurchase = () => {
        // const validation = validatePurchase()

        // if (!validation.isValid) {
        //     Alert.alert('Incomplete Selection', validation.errors.join('\n'))
        //     return
        // }

        // Navigate to purchase summary screen
        router.push({ pathname: '/product-detail/purchase-summary', params: { productId: productId } })
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
                    <Text className="text-3xl font-bold text-primary">{formatPrice(Number(product.price))}</Text>
                    <Text className="text-sm text-muted-foreground">
                        {product.total_sold} sold • In stock: {product.stock}
                    </Text>
                </View>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <View className="space-y-3 my-2">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-sm font-semibold text-primary font-poppins">Colors</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={clearColors}
                                    className="px-2 py-1 rounded-md bg-gray-100"
                                >
                                    <Text className="text-xs text-gray-600">Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={setAllColors}
                                    className="px-2 py-1 rounded-md bg-orange-100"
                                >
                                    <Text className="text-xs text-orange-600">All</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {product.colors.map((color, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => toggleColor(color)}
                                    className={`w-10 h-10 rounded-full border-2 ${isColorSelected(color)
                                        ? 'border-primary'
                                        : 'border-gray-300'
                                        } relative`}
                                    style={{ backgroundColor: color }}
                                >
                                    {isColorSelected(color) && (
                                        <View className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-5 h-5 justify-center items-center">
                                            <Ionicons name="checkmark" size={12} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}


                {/* Sizes */}
                {availableSizes.length > 0 && (
                    <View className="space-y-3 my-2">
                        <View className="flex-row justify-between items-center">
                            <Text className="text-sm font-semibold text-primary font-poppins">Sizes</Text>
                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={clearSizes}
                                    className="px-2 py-1 rounded-md bg-gray-100"
                                >
                                    <Text className="text-xs text-gray-600">Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={setAllSizes}
                                    className="px-2 py-1 rounded-md bg-orange-100"
                                >
                                    <Text className="text-xs text-orange-600">All</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View className="flex-row flex-wrap gap-3">
                            {availableSizes.map((size, index) => {
                                return (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => toggleSize(size)}
                                        className={`h-10 min-w-[40px] px-3 justify-center items-center rounded-lg border-[1px] relative ${isSizeSelected(size)
                                            ? 'border-primary bg-orange-500'
                                            : 'border-gray-300 bg-transparent'
                                            }`}
                                    >
                                        <Text className={`font-medium ${isSizeSelected(size)
                                            ? 'text-white'
                                            : 'text-orange-400'
                                            }`}>
                                            {size.toUpperCase()}
                                        </Text>
                                        {isSizeSelected(size) && (
                                            <View className="absolute -top-1 -right-1 bg-orange-600 rounded-full w-4 h-4 justify-center items-center">
                                                <Ionicons name="checkmark" size={10} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                )
                            })}
                        </View>
                    </View>
                )}

                {/* Quantity */}
                <View className="space-y-3">
                    <Text className="text-sm font-semibold text-primary font-poppins my-2">Quantity</Text>
                    <View className="flex-row items-center space-x-4">
                        <TouchableOpacity
                            onPress={decrementQuantity}
                            className="w-10 h-10 rounded-lg border border-gray-300 justify-center items-center"
                            disabled={quantity <= 1}
                        >
                            <Ionicons
                                name="remove"
                                size={20}
                                color={quantity <= 1 ? "#ccc" : "gray"}
                            />
                        </TouchableOpacity>
                        <Text className="text-xl font-semibold text-primary min-w-[60px] text-center">
                            {quantity}
                        </Text>
                        <TouchableOpacity
                            onPress={incrementQuantity}
                            className="w-10 h-10 rounded-lg border border-gray-300 justify-center items-center"
                            disabled={quantity > product.stock}
                        >
                            <Ionicons
                                name="add"
                                size={20}
                                color={quantity > product.stock ? "#ccc" : "gray"}
                            />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-xs text-muted">
                        Max available: {product.stock}
                    </Text>
                </View>


                {/* Description */}
                <View className="space-y-2 my-4">
                    <Text className="text-sm font-semibold text-primary font-poppins">Description</Text>
                    <Text className="text-base text-muted font-poppins-light leading-6">{product.description}</Text>
                </View>



                {/* Total Price */}
                <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-4">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-sm text-primary font-poppins-bold">Total</Text>
                            <Text className="text-xs text-muted">
                                {quantity} item{quantity > 1 ? 's' : ''} × ₦{Number(product.price).toLocaleString()}
                            </Text>
                        </View>
                        <Text className="text-2xl bg-orange-800/25 text-orange-500 font-bold rounded-lg px-4 py-2 text-center">
                            {formatPrice(Number(product.price) * quantity)}
                        </Text>
                    </View>
                </View>





                {/* Next Button */}
                <View className="pb-6 mb-6">
                    <AppVariantButton
                        label={"Next"}
                        onPress={handleContinueToPurchase}
                        disabled={buyMutation.isPending}
                    />
                </View>
            </View>
        </ProductDetailWrapper>
    )
}

export default ProductDetail
