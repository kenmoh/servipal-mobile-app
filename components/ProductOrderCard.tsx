import { ProduductOrderResponse } from '@/types/marketplace';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ProductOrderCardProps = {
    data: ProduductOrderResponse
}

const ProductOrderCard = ({ data }: ProductOrderCardProps) => {

    const cardRef = useRef<View>(null);

    const getPaymentStatusStyle = () => {
        switch (data?.order_payment_status) {
            case 'paid':
                return {
                    bgColor: 'bg-green-100 dark:bg-green-900/30',
                    textColor: 'text-green-700 dark:text-green-400',
                    borderColor: 'border-green-200 dark:border-green-700'
                }
            case 'pending':
                return {
                    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
                    textColor: 'text-amber-700 dark:text-amber-400',
                    borderColor: 'border-amber-200 dark:border-amber-700'
                }
            case 'failed':
                return {
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    textColor: 'text-red-700 dark:text-red-400',
                    borderColor: 'border-red-200 dark:border-red-700'
                }
            default:
                return {
                    bgColor: 'bg-gray-100 dark:bg-gray-800',
                    textColor: 'text-gray-700 dark:text-gray-300',
                    borderColor: 'border-gray-200 dark:border-gray-600'
                }
        }
    }

    const getOrderStatusStyle = () => {
        switch (data?.order_status) {
            case 'received':
                return {
                    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
                    textColor: 'text-emerald-700 dark:text-emerald-400',
                    borderColor: 'border-emerald-200 dark:border-emerald-700'
                }
            case 'delivered':
                return {
                    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
                    textColor: 'text-blue-700 dark:text-blue-400',
                    borderColor: 'border-blue-200 dark:border-blue-700'
                }
            case 'pending':
                return {
                    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
                    textColor: 'text-orange-700 dark:text-orange-400',
                    borderColor: 'border-orange-200 dark:border-orange-700'
                }
            case 'cancelled':
                return {
                    bgColor: 'bg-red-100 dark:bg-red-900/30',
                    textColor: 'text-red-700 dark:text-red-400',
                    borderColor: 'border-red-200 dark:border-red-700'
                }
            default:
                return {
                    bgColor: 'bg-gray-100 dark:bg-gray-800',
                    textColor: 'text-gray-700 dark:text-gray-300',
                    borderColor: 'border-gray-200 dark:border-gray-600'
                }
        }
    }

    const handleOrderPress = () => {
        router.push({ pathname: '/product-detail/[orderId]', params: { orderId: data?.id } })
    };

    return (
        <View
            ref={cardRef}
            style={{ borderWidth: StyleSheet.hairlineWidth }}
            className='bg-input rounded-2xl w-[45%] my-[2.5%] h-[200px] overflow-hidden border-gray-800/25'
        >

            <TouchableOpacity onPress={handleOrderPress}>

                <View className='absolute bottom-0 z-40 flex-row w-full justify-between px-2 mb-1'>
                    <Text className="text-yellow-500 font-poppins-medium text-base capitalize">{data?.order_payment_status}</Text>
                    <Text className="text-yellow-600 font-poppins-medium text-base capitalize">{data?.order_status}</Text>
                </View>
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.9)"]}
                    style={styles.gradient}
                />

                <Image
                    source={{ uri: data?.order_items[0].images[0].url }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />


            </TouchableOpacity>
        </View>

    );
};

export default ProductOrderCard;

const styles = StyleSheet.create({

    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 75,
    },
});






