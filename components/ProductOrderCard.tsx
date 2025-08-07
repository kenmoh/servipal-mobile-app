import { useProductModal } from '@/contexts/ProductModalContext';
import { CreateProductResponse } from '@/types/marketplace';
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SharedValue } from 'react-native-reanimated';

type ProductOrderCardProps = {
    isOrder?: boolean,
    data: CreateProductResponse
}

const ProductOrderCard = ({ data, isOrder = true }: ProductOrderCardProps) => {
    const { openModal } = useProductModal();
    const cardRef = useRef<View>(null);

    const handlePress = () => {
        // Only show modal if isOrder is true
        if (!isOrder) return;

        // Measure the card position
        cardRef.current?.measure((x, y, width, height, pageX, pageY) => {
            openModal(data, {
                x: pageX,
                y: pageY,
                width,
                height
            });
        });
    };

    return (
        <View
            ref={cardRef}
            className='bg-input rounded-2xl w-[45%] my-[2.5%] h-[200px] overflow-hidden'
        >
            <TouchableOpacity onPress={handlePress}>
                <Image
                    source={{ uri: data?.images[0].url }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {!isOrder && (
                    <>
                        <View className="px-3 absolute bottom-0 right-0 left-0 z-50">
                            <Text className="text-white font-poppins-bold text-base">₦ {data?.price}</Text>
                            <Text className='text-white font-poppins-light text-wrap'>{data?.name}</Text>
                        </View>
                        <LinearGradient
                            colors={["transparent", "rgba(0,0,0,0.7)"]}
                            style={styles.gradient}
                        />
                    </>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default ProductOrderCard;




type CardDetailProp = {
    data: CreateProductResponse | null
    isVisible: SharedValue<boolean>
    onClose: () => void
}

const { width, height } = Dimensions.get('window')



const styles = StyleSheet.create({
    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 75,
    },


})
