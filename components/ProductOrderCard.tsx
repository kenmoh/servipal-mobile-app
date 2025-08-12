import { useProductModal } from '@/contexts/ProductModalContext';
import { ProduductOrderResponse } from '@/types/marketplace';
import { router } from 'expo-router';
import React, { useRef } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type ProductOrderCardProps = {
    data: ProduductOrderResponse
}

const ProductOrderCard = ({ data }: ProductOrderCardProps) => {
    const { openModal } = useProductModal();
    const cardRef = useRef<View>(null);



    const handleOrderPress = () => {
        // Measure the card position
        // cardRef.current?.measure((x, y, width, height, pageX, pageY) => {
        //     openModal(data, {
        //         x: pageX,
        //         y: pageY,
        //         width,
        //         height
        //     });
        // });

        router.push({ pathname: '/product-detail/[orderId]', params: { orderId: data?.id } })
    };

    return (
        <View
            ref={cardRef}
            style={{ borderWidth: StyleSheet.hairlineWidth }}
            className='bg-input rounded-2xl w-[45%] my-[2.5%] h-[200px] overflow-hidden border-gray-800/25'
        >
            <TouchableOpacity onPress={handleOrderPress}>
                <View className='bg-orange-700/25 rounded-2xl items-center justify-center px-3 py-1 absolute bottom-2 left-2 z-40'>
                    <Text className='text-orange-500 text-center text-base font-poppins-medium'>{data?.order_payment_status}</Text>
                </View>
                <Image
                    source={{ uri: data?.order_items[0].images[0].url }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />


            </TouchableOpacity>
        </View>

    );
};

export default ProductOrderCard;






