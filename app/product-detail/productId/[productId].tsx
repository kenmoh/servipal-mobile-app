import { buyItem, fetchProduct } from '@/api/product'
import { fetchProductReviewsCount } from '@/api/review'
import AppVariantButton from '@/components/core/AppVariantButton'
import ProductDetailWrapper from '@/components/ProductDetailWrapper'
import { usePurchaseActions, usePurchaseSelectors } from '@/store/productStore'
import { Star } from "lucide-react-native";
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
    } = usePurchaseActions()

    const {
        product,
        quantity,
        selectedSizes,
        selectedColors,
        availableSizes,
        isLoading: storeLoading,
        error: storeError
    } = usePurchaseSelectors()



    const { data, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => fetchProduct(productId!),
        enabled: !!productId,
    })

    const { data: count } = useQuery({
        queryKey: ['Review', productId],
        queryFn: () => fetchProductReviewsCount(productId)
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
                <Text className="text-sm text-primary font-poppins-bold mb-6">Product not found</Text>
                <AppVariantButton width={'50%'} outlineColor='orange' outline={true} filled={false} borderRadius={50} label="Go Back" onPress={() => router.back()} />
            </View>
        )
    }

    const handleContinueToPurchase = () => {
        // Validate that selected colors match quantity
        if (selectedColors.length > 0 && selectedColors.length !== quantity) {
            Alert.alert(
                'Color Selection Error',
                `You have selected ${selectedColors.length} color${selectedColors.length > 1 ? 's' : ''} but quantity is ${quantity}. Please select exactly ${quantity} color${quantity > 1 ? 's' : ''} or adjust the quantity to match your color selection.`
            )
            return
        }

        // Navigate to purchase summary screen
        router.push({ pathname: '/product-detail/purchase-summary', params: { productId: productId } })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(price)
    }

console.log(product)

    return (
        <ProductDetailWrapper images={product.images}>
            <View className="flex-1 px-6 space-y-6">
                {/* Title and Price */}
                <View className="space-y-2">
                    <View className='flex-row justify-between items-center'>
                        <Text className="text-xl font-poppins-medium text-muted ">{product.name}</Text>
                        <TouchableOpacity className='flex-row items-center gap-2' onPress={() => router.push({ pathname: '/product-detail/product-reviews', params: { productId: product.id } })}>
                            <Ionicons name="chatbox-ellipses-outline" size={20} color="gray" />
                            <View className="flex-row gap-2">
                            <Text className="text-sm font-poppins-light underline text-muted">Reviews ({count ? count?.reviews_count : 0})</Text>
                           {count?.average_rating &&  <View className="flex-row items-center gap-1">
                            <Text className="text-sm font-poppins-light text-muted">{count.average_rating}</Text>
                            <Star size={12} color="gold"/>
                            </View>}
                            </View>
                        </TouchableOpacity>
                    </View>
                    <Text className="text-3xl font-bold text-primary">{formatPrice(Number(product.price))}</Text>
                    <Text className="text-sm text-muted">
                        {product.total_sold || 0} sold • In stock: {product.stock}
                    </Text>
                </View>

                {/* Colors */}
                {product.colors && product.colors.length > 0 && (
                    <View className="space-y-3 my-2">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2">
                                    <Text className="text-sm text-primary font-poppins">Colors</Text>
                                    <View className={`px-2 py-1 rounded-full ${selectedColors.length === quantity && selectedColors.length > 0 ? 'bg-green-100' : selectedColors.length > 0 ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                        <Text className={`text-xs font-medium ${selectedColors.length === quantity && selectedColors.length > 0 ? 'text-green-600' : selectedColors.length > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                                            {selectedColors.length}/{quantity}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-xs text-muted mt-1">
                                    Select {quantity} color{quantity > 1 ? 's' : ''} (matches quantity)
                                </Text>
                            </View>
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
                                    className={`w-7 h-7 rounded-full border-2 ${isColorSelected(color)
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
                                            : 'border-gray-500 bg-transparent'
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
                            className="w-10 h-10 rounded-lg border border-gray-500 justify-center items-center"
                            disabled={quantity <= 1}
                        >
                            <Ionicons
                                name="remove"
                                size={20}
                                color={quantity <= 1 ? "#ddd" : "gray"}
                            />
                        </TouchableOpacity>
                        <Text className="text-xl font-semibold text-primary min-w-[60px] text-center">
                            {quantity}
                        </Text>
                        <TouchableOpacity
                            onPress={incrementQuantity}
                            className="w-10 h-10 rounded-lg border border-gray-500 justify-center items-center"
                            disabled={quantity > product.stock}
                        >
                            <Ionicons
                                name="add"
                                size={20}
                                color={quantity > product.stock ? "#ddd" : "gray"}
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
                {quantity > 0 &&
                    <View className="pb-6 mb-6">
                        <AppVariantButton
                            label={"Next"}
                            onPress={handleContinueToPurchase}
                            disabled={buyMutation.isPending}
                        />
                    </View>}
            </View>
        </ProductDetailWrapper>
    )
}

export default ProductDetail
