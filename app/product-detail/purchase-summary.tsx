import { buyItem } from '@/api/product'
import AppVariantButton from '@/components/core/AppVariantButton'
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme'
import { usePurchaseActions, usePurchaseSelectors } from '@/store/productStore'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { router, Stack, useLocalSearchParams } from 'expo-router'
import React, { useEffect } from 'react'
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native'

const PurchaseSummary = () => {
    const { productId } = useLocalSearchParams<{ productId: string }>()

    const theme = useColorScheme()

    const {
        product,
        quantity,
        selectedSizes,
        selectedColors,
        additionalInfo,
        totalPrice,


    } = usePurchaseSelectors()

    const {
        setAdditionalInfo,
        resetPurchase,
        validatePurchase,
        incrementQuantity,
        decrementQuantity,

    } = usePurchaseActions()

    // Redirect if no product data
    useEffect(() => {
        if (!product) {
            Alert.alert('Error', 'No product selected', [
                { text: 'OK', onPress: () => router.back() }
            ])
        }
    }, [product])

    const buyMutation = useMutation({
        mutationFn: (data: any) => buyItem(productId!, data),
        onSuccess: () => {
            Alert.alert(
                'Success!',
                'Order created successfully! Make payment to confirm order',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetPurchase()
                            router.push({
                                pathname: '/payment/[orderId]',
                                params: { orderId: productId },


                            })
                        }
                    }
                ]
            )
        },
        onError: (error: any) => {
            Alert.alert('Purchase Failed', error.message || 'Failed to process your order. Please try again.')
        }
    })

    const handlePurchase = () => {
        const validation = validatePurchase()

        if (!validation.isValid) {
            Alert.alert('Field Rquired', validation.errors.join('\n'))
            return
        }

        // Prepare buy data in the exact format expected by the server
        const buyData = {
            quantity,
            sizes: selectedSizes.join(', '), // Convert array to comma-separated string
            colors: selectedColors,
            additional_info: additionalInfo
        }


        console.log(buyData)

        Alert.alert(
            'Confirm Purchase',
            `Are you sure you want to purchase this item for ${formatPrice(Number(product?.price) * quantity)}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: () => buyMutation.mutate(buyData),
                    style: 'default'
                }
            ]
        )
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(price)
    }

    const getDisplayImage = () => {
        if (product?.images && product.images.length > 0) {
            return product.images[0].url
        }
        return null
    }

    const unitPrice = product ? parseFloat(product.price) : 0

    if (!product) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size="large" color="gray" />
                <Text className="text-sm text-muted mt-4">Loading...</Text>
            </View>
        )
    }
    return (
        <>
            {/* Header */}
            <Stack.Screen
                options={{
                    title: 'Purchase Summary',
                    headerShadowVisible: false,
                    headerTintColor: theme === 'dark' ? '#fff' : '#000',
                    headerTitleStyle: {
                        fontFamily: 'Poppins-Medium',

                    },
                    headerStyle: {
                        backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,

                    },

                }}
            />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <ScrollView className="bg-background flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                    <View className="p-4 gap-4 flex-1">
                        {/* Product Summary Card */}
                        <View className="bg-input rounded-xl p-4">
                            <View className="flex-row space-x-4">
                                {/* Product Image */}
                                <View className="w-20 h-20 rounded-lg overflow-hidden">
                                    {getDisplayImage() ? (
                                        <Image
                                            source={{ uri: getDisplayImage()! }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-full h-full justify-center items-center">
                                            <Ionicons name="image-outline" size={30} color="#ccc" />
                                        </View>
                                    )}
                                </View>

                                {/* Product Details */}
                                <View className="flex-1 space-y-2 ml-5">
                                    <Text className="text-lg text-primary font-poppins" numberOfLines={2}>
                                        {product.name}
                                    </Text>
                                    <Text className="text-sm text-muted font-poppins">
                                        From {product.store_name}
                                    </Text>
                                    <Text className="text-xl font-bold text-orange-600">
                                        {formatPrice(unitPrice)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Selection Details */}
                        <View className="bg-input rounded-xl p-4  space-y-4">
                            <Text className="text-lg font-semibold text-primary font-poppins">Your Selection</Text>

                            {/* Colors */}
                            {selectedColors.length > 0 && (
                                <View className="space-y-2">
                                    <Text className="text-sm font-medium text-primary font-poppins">Colors</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {selectedColors.map((color, index) => (
                                            <View key={index} className="flex-row items-center space-x-2 bg-gray-50 rounded-full px-3 py-1">
                                                <View
                                                    className="w-4 h-4 rounded-full border border-gray-300"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <Text className="text-sm text-gray-700 capitalize">{color}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Sizes */}
                            {selectedSizes.length > 0 && (
                                <View className="space-y-2 mt-3">
                                    <Text className="text-sm font-medium text-primary font-poppins">Sizes</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {selectedSizes.map((size, index) => (
                                            <View key={index} className="bg-orange-500/10 rounded-lg px-3 py-1">
                                                <Text className="text-sm font-medium text-orange-700">{size.toUpperCase()}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Quantity */}
                            <View className="space-y-2 mt-3">
                                <Text className="text-sm font-medium text-primary font-poppins">Quantity</Text>
                                <View className="flex-row items-center gap-4">
                                    <TouchableOpacity
                                        onPress={decrementQuantity}
                                        className="w-10 h-10 rounded-lg border border-gray-500 justify-center items-center"
                                        disabled={quantity <= 1}
                                    >
                                        <Ionicons
                                            name="remove"
                                            size={20}
                                            color={quantity <= 1 ? "#ccc" : "gray"}
                                        />
                                    </TouchableOpacity>

                                    <Text className="text-lg font-semibold text-primary text-center">
                                        {quantity}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={incrementQuantity}
                                        className="w-10 h-10 rounded-lg border border-gray-500 justify-center items-center"
                                        disabled={quantity >= product.stock}
                                    >
                                        <Ionicons
                                            name="add"
                                            size={20}
                                            color={quantity >= product.stock ? "#ccc" : "gray"}
                                        />
                                    </TouchableOpacity>
                                </View>
                                <Text className="text-xs text-muted">
                                    Available stock: {product.stock}
                                </Text>
                            </View>
                        </View>

                        {/* Additional Information */}
                        <View className="bg-input rounded-xl p-4  space-y-3">
                            <Text className="text-lg font-semibold text-primary font-poppins">Delivery Information</Text>
                            <Text className="text-sm text-gray-500 font-poppins-light mb-1">
                                Provide your delivery address and any special instructions you may have.

                            </Text>

                            <TextInput
                                value={additionalInfo}
                                onChangeText={setAdditionalInfo}
                                placeholder="Delivery address, special instructions, etc..."
                                multiline
                                numberOfLines={4}
                                className="p-4 border rounded-lg text-primary border-orange-300/35 font-poppins bg-input text-sm"
                                placeholderTextColor="#999"
                                textAlignVertical="top"
                            />
                        </View>

                        {/* Price Breakdown */}
                        <View className="rounded-xl p-4  bg-input space-y-3">
                            <Text className="text-lg font-semibold text-primary font-poppins">Price Breakdown</Text>

                            <View className="space-y-2">
                                <View className="flex-row justify-between items-center font-poppins-light">
                                    <Text className="text-sm text-muted font-poppins-light">Unit Price</Text>
                                    <Text className="text-sm text-muted">{formatPrice(unitPrice)}</Text>
                                </View>

                                <View className="flex-row justify-between items-center">
                                    <Text className="text-sm font-poppins-light text-muted">Quantity</Text>
                                    <Text className="text-sm text-muted font-poppins-light">× {quantity}</Text>
                                </View>

                                <View className="border-t border-gray-600 pt-2">
                                    <View className="flex-row justify-between items-center">
                                        <Text className="text-lg font-bold text-primary">Total</Text>
                                        <Text className="text-2xl font-bold text-orange-600">
                                            {formatPrice(Number(product.price) * quantity)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>



                        {/* Purchase Button */}
                        <View className="pt-4 pb-2">
                            <AppVariantButton
                                label={buyMutation.isPending ? "Processing Order..." : `Purchase for ${formatPrice(Number(product.price) * quantity)}`}
                                onPress={handlePurchase}
                                disabled={buyMutation.isPending}
                            />

                            {buyMutation.isPending && (
                                <View className="flex-row justify-center items-center mt-3">
                                    <ActivityIndicator size="small" color="#f97316" />
                                    <Text className="text-sm text-gray-600 ml-2">Processing your order...</Text>
                                </View>
                            )}
                        </View>

                        {/* Order Summary Footer */}
                        <View className="bg-orange-200/15 rounded-xl p-4  mb-8">
                            <Text className="text-xs text-orange-500 font-poppins-light">
                                By placing this order, you agree to our terms and conditions.
                                Your order will be processed immediately after confirmation.
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </>
    )
}

export default PurchaseSummary