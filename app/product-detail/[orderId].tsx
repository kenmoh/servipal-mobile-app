import { fetProductOrderDetails } from '@/api/marketplace'
import AppVariantButton from '@/components/core/AppVariantButton'
import ProductDetailWrapper from '@/components/ProductDetailWrapper'
import { useAuth } from '@/context/authContext'
import { useQuery } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'


const ProductDetail = () => {
    const { orderId } = useLocalSearchParams<{ orderId: string }>()
    const { user } = useAuth()

    const { data, isLoading } = useQuery({
        queryKey: ['product-order', orderId],
        queryFn: () => fetProductOrderDetails(orderId!),
        enabled: !!orderId,
    })


    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <ActivityIndicator size={'large'} color={'gray'} />
            </View>
        )
    }

    if (!data) {
        return (
            <View className="flex-1 justify-center items-center bg-background">
                <Text className="text-sm text-primary font-poppins-bold mb-6">Order not found</Text>
                <AppVariantButton width={'50%'} outlineColor='orange' outline={true} filled={false} borderRadius={50} label="Go Back" onPress={() => router.back()} />
            </View>
        )
    }

    console.log(data?.order_items[0].colors)

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(price)
    }

    return (
        <ProductDetailWrapper images={data?.order_items[0]?.images}>
            <View className="flex-1 px-6 space-y-6">
                {/* Title and Price */}
                <View className="space-y-2">
                    <Text className="text-2xl font-bold text-muted font-poppins-bold">{data?.order_items[0]?.name}</Text>

                    <Text className="text-3xl font-poppins-semibold text-primary">{formatPrice(Number(data.total_price))}</Text>
                    <View className='flex-row justify-between items-center my-3'>
                        <Text className="text-sm font-poppins-bold text-muted"> Paymenet Status</Text>
                        <Text className="text-sm font-poppins-bold py-2 px-4 rounded-3xl capitalize bg-orange-800/25 text-orange-300"> {data?.order_payment_status}</Text>
                    </View>



                </View>

                {/* Colors */}
                {data?.order_items[0].colors && data?.order_items[0].colors.length > 0 && (
                    <View className="space-y-3 my-2">


                        <View className="flex-row flex-wrap gap-3">
                            {data?.order_items[0].colors.map((color, index) => (
                                <View
                                    key={index}

                                    className={`w-10 h-10 rounded-full border-2`}
                                    style={{ backgroundColor: color }}
                                >

                                </View>
                            ))}
                        </View>
                    </View>
                )}


                {/* Sizes */}
                {data?.order_items[0].sizes && (
                    <View className="space-y-3 my-2">


                        <View className="flex-row flex-wrap gap-3">
                            {data?.order_items[0].sizes.split(',').map((size, index) => {
                                return (
                                    <View
                                        key={index}

                                        className={`h-10 min-w-[40px] px-3 justify-center items-center rounded-lg border-[1px] bg-orange-800/25`}
                                    >
                                        <Text className={`font-poppins-semibold text-base text-primary`}>
                                            {size.toUpperCase()}
                                        </Text>

                                    </View>
                                )
                            })}
                        </View>
                    </View>
                )}

                {/* Quantity */}
                <View className="gap-3 flex-row justify-between">
                    <View className="flex-row items-center">
                        <Text className="text-sm font-semibold text-primary font-poppins my-2">Quantity:</Text>

                        <Text className="text-xl font-semibold text-primary min-w-[60px] text-center">
                            {data?.order_items[0].quantity}
                        </Text>

                    </View>
                    <Text className="text-xl font-semibold text-primary min-w-[60px] text-center">
                        Order#: {data?.order_number}
                    </Text>

                </View>


                {/* Description */}
                <View className="space-y-2 my-4">
                    <Text className="text-sm font-semibold text-primary font-poppins">Buyer Details</Text>
                    <Text className="text-base text-muted font-poppins-light leading-6">{data?.additional_info}</Text>
                </View>



                {/* Total Price */}
                <View className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg my-4 gap-4">
                    <View className="flex-row justify-between items-center gap-4">
                        <View>
                            <Text className="text-sm text-primary font-poppins-bold">Total</Text>
                            <Text className="text-xs text-muted">
                                {data?.order_items[0].quantity} item{data?.order_items[0].quantity > 1 ? 's' : ''} × ₦{Number(data.order_items[0].price).toLocaleString()}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-2xl bg-orange-800/25 text-orange-500 font-bold rounded-lg px-4 py-2 text-center">
                                {formatPrice(Number(data.order_items[0].price) * data?.order_items[0].quantity)}
                            </Text>

                        </View>
                    </View>

                    {
                        user?.sub === data?.order_items[0].user_id && (
                            <View className="flex-row justify-between items-center gap-4">
                                <View>
                                    <Text className="text-sm text-primary font-poppins-bold">Amount Due</Text>

                                </View>
                                <View>
                                    <Text className="text-2xl bg-orange-800/25 text-orange-500 font-bold rounded-lg px-4 py-2 text-center">
                                        {formatPrice(Number(data?.amount_due_vendor))}
                                    </Text>
                                </View>
                            </View>
                        )
                    }
                </View>





                {/* Next Button */}
                <View className="pb-6 mb-6 gap-4">

                    {data?.order_payment_status === 'pending' && <AppVariantButton
                        label={"Pay Now"}
                        onPress={() => router.push({
                            pathname: '/payment/[orderId]',
                            params: {
                                orderId: orderId,
                                orderType: data?.order_type,
                                orderNumber: data?.order_number,
                                paymentLink: data?.payment_link,
                                orderItems: JSON.stringify(data?.order_items),

                            }
                        })}

                    />}
                    <AppVariantButton
                        label={"Delivered"}
                        outline={true}
                        outlineColor={'orange'}
                        filled={false}
                        onPress={() => console.log('first')}
                    // disabled={buyMutation.isPending}
                    />
                </View>
            </View>
        </ProductDetailWrapper>
    )
}

export default ProductDetail
