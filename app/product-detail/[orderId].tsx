import { buyerRejectedItem, fetProductOrderDetails, orderDelivered, orderReceived, vendorRecivedRejectedItem } from '@/api/marketplace'
import AppVariantButton from '@/components/core/AppVariantButton'
import ProductDetailWrapper from '@/components/ProductDetailWrapper'
import { useToast } from '@/components/ToastProvider'
import { useAuth } from '@/context/authContext'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router, useLocalSearchParams } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Text, View } from 'react-native'


const ProductDetail = () => {
    const { user } = useAuth()
    const { orderId } = useLocalSearchParams<{ orderId: string }>()
    const { showSuccess, showError, showWarning, showInfo, } = useToast();

    const queryClient = useQueryClient()


    const { data, isLoading, refetch } = useQuery({
        queryKey: ['product-order', orderId],
        queryFn: () => fetProductOrderDetails(orderId!),
        enabled: !!orderId,
    })


    const getButtonLabel = () => {
        if (user?.sub === data?.vendor_id && data?.order_payment_status === 'paid' && data?.order_status === 'pending') {
            return "Mark as Delivered"
        }
        if (user?.sub === data?.user_id && data?.order_status === 'delivered') {
            return "Mark as Received"
        }
        // Return a more user-friendly status display
        const statusDisplay = data?.order_status === 'received_rejected_product' ? 'Return Confirmed' : data?.order_status?.toUpperCase()
        return statusDisplay || 'UNKNOWN'
    }
    const label = getButtonLabel()
    const orderDeliveredMutation = useMutation({
        mutationFn: () => orderDelivered(orderId!),
        onSuccess: () => {
            showSuccess('Success', 'Order marked as delivered');
            queryClient.invalidateQueries({ queryKey: ['product-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['products',] });
            refetch()
        },
        onError: (error) => showError('Error', error.message || 'Failed to deliver order'),


    })
    const orderReceiveddMutation = useMutation({
        mutationFn: () => orderReceived(orderId!),
        onSuccess: () => {
            showSuccess('Success', 'Order marked as received');
            queryClient.invalidateQueries({ queryKey: ['product-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
            refetch()
        },
        onError: (error) => showError('Error', error.message || 'Failed to deliver order'),
    })

    // Buyer rejecting item mutation
    const buyerRejectMutation = useMutation({
        mutationFn: () => buyerRejectedItem(orderId!),
        onSuccess: () => {
            showWarning('Success', 'Item rejected.');
            queryClient.invalidateQueries({ queryKey: ['product-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => showError('Error', error.message || 'Failed to reject item'),
    })

    // Vendor received rejected item mutation
    const vendorReceivedRejectedMutation = useMutation({
        mutationFn: () => vendorRecivedRejectedItem(orderId!),
        onSuccess: () => {
            showInfo('Success', 'Rejected item received.');
            queryClient.invalidateQueries({ queryKey: ['product-order', orderId] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error) => showError('Error', error.message || 'Failed to confirm rejected item received'),
    })

    const handleButtonPress = () => {
        // Customer trying to mark as received
        if (user?.sub === data?.user_id) {
            if (data?.order_status !== 'delivered') {
                showWarning('Warning', 'Order must be delivered by vendor before you can mark it as received')
                return
            }
            if (data?.order_status === 'received') {
                showWarning('Warning', 'Order has already been marked as received')
                return
            }
            // All checks passed, mark as received
            orderReceiveddMutation.mutate()
        }

        // Vendor trying to mark as delivered
        if (user?.sub === data?.vendor_id) {
            if (data?.order_payment_status !== 'paid') {
                showWarning('Warning', 'Order must be paid before it can be delivered')
                return
            }
            if (data?.order_status !== 'pending') {
                showWarning('Warning', 'Order has already been processed')
                return
            }
            // All checks passed, mark as delivered
            orderDeliveredMutation.mutate()
        }
    }




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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(price)
    }

    console.log(data?.order_status)

    return (
        <ProductDetailWrapper images={data?.order_items[0]?.images}>
            <View className="flex-1 px-6 space-y-6">
                {/* Title and Price */}
                <View className="space-y-2">
                    <Text className="text-2xl font-bold text-muted font-poppins-bold">{data?.order_items[0]?.name}</Text>

                    <Text className="text-3xl font-poppins-semibold text-primary">{formatPrice(Number(data.total_price))}</Text>
                    <View className='flex-row justify-between items-center my-3'>
                        <Text className="text-sm font-poppins-bold text-muted">Payment Status</Text>
                        <Text className={`text-sm font-poppins-bold py-2 px-4 rounded-3xl capitalize ${data?.order_payment_status === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            data?.order_payment_status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                data?.order_payment_status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                    data?.order_payment_status === 'cancelled' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400' :
                                        data?.order_payment_status === 'refunded' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400'
                            }`}>{data?.order_payment_status}</Text>
                    </View>
                    <View className='flex-row justify-between items-center my-3'>
                        <Text className="text-sm font-poppins-bold text-muted">Order Status</Text>
                        <Text className={`text-sm font-poppins-bold py-2 px-4 rounded-3xl capitalize ${data?.order_status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            data?.order_status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                data?.order_status === 'received' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                    data?.order_status === 'pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                        data?.order_status === 'received_rejected_product' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                            data?.order_status === 'cancelled' ? 'bg-gray-100 text-gray-700 dark:bg-gray-800/30 dark:text-gray-400' :
                                                'bg-slate-100 text-slate-700 dark:bg-slate-800/30 dark:text-slate-400'
                            }`}>
                            {data?.order_status === 'received_rejected_product' ? 'Return Confirmed' : data?.order_status}
                        </Text>
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






                <View className="pb-6 mb-6 gap-4">
                    {/* Pay Now Button - Only for buyers with pending payment */}
                    {data?.order_payment_status === 'pending' && user?.sub === data?.user_id &&
                        <AppVariantButton
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
                        />
                    }

                    {/* Vendor Actions */}
                    {user?.sub === data.vendor_id && (
                        <>
                            {/* Main vendor button (Deliver) - only show for pending status */}
                            {data?.order_status === 'pending' && data?.order_payment_status === 'paid' && (
                                <AppVariantButton
                                    label="Mark as Delivered"
                                    outline={true}
                                    borderRadius={100}
                                    outlineColor={'orange'}
                                    filled={false}
                                    isLoading={orderDeliveredMutation.isPending}
                                    onPress={handleButtonPress}
                                    disabled={orderDeliveredMutation.isPending}
                                />
                            )}

                            {/* Vendor confirm rejected item received - only if status is rejected */}
                            {data?.order_status === 'rejected' && (
                                <AppVariantButton
                                    label="Confirm Rejected Item Received"
                                    borderRadius={100}
                                    outline={true}
                                    outlineColor={'red'}
                                    filled={false}
                                    isLoading={vendorReceivedRejectedMutation.isPending}
                                    onPress={() => vendorReceivedRejectedMutation.mutate()}
                                    disabled={vendorReceivedRejectedMutation.isPending}
                                />
                            )}

                            {/* Debug info - remove this after testing */}
                            <Text className="text-xs text-muted mt-2">
                                Debug - Status: {data?.order_status} | User: {user?.sub === data.vendor_id ? 'Vendor' : 'Other'}
                            </Text>
                        </>
                    )}

                    {/* Buyer Actions */}
                    {user?.sub === data.user_id && (
                        <>
                            {/* Main buyer button (Receive) - only show when delivered */}
                            {data?.order_status === 'delivered' && (
                                <AppVariantButton
                                    label="Mark as Received"
                                    outline={true}
                                    outlineColor={'orange'}
                                    filled={false}
                                    borderRadius={100}
                                    isLoading={orderReceiveddMutation.isPending}
                                    onPress={handleButtonPress}
                                    disabled={orderReceiveddMutation.isPending}
                                />
                            )}

                            {/* Buyer reject button - only if status is delivered */}
                            {data?.order_status === 'delivered' && (
                                <AppVariantButton
                                    label="Reject Item"
                                    outline={true}
                                    borderRadius={100}
                                    outlineColor={'red'}
                                    filled={false}
                                    isLoading={buyerRejectMutation.isPending}
                                    onPress={() => buyerRejectMutation.mutate()}
                                    disabled={buyerRejectMutation.isPending}
                                />
                            )}

                            {/* Debug info - remove this after testing */}
                            <Text className="text-xs text-muted mt-2">
                                Debug - Status: {data?.order_status} | User: {user?.sub === data.user_id ? 'Buyer' : 'Other'}
                            </Text>
                        </>
                    )}
                </View>
            </View>
        </ProductDetailWrapper>
    )
}

export default ProductDetail
