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
    const rejectedText = data?.order_status === 'received_rejected_product' ? 'rejected' : data?.order_status;

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
                    <Text className="text-white z-50 font-poppins-medium text-base capitalize">{rejectedText}</Text>
                </View>
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.9)"]}
                    style={styles.gradient}
                />

                <Image
                    src={data?.order_items?.[0]?.item?.images?.[0]?.url}
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
        zIndex: 30,
    },
});






