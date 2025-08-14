
import { CreateProductResponse } from "@/types/marketplace";
import { router } from "expo-router";
import { Store } from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


const CARD_HEIGHT = Dimensions.get("screen").height * 0.28;

const ProductCard = ({ product }: { product: CreateProductResponse }) => {
    const handlePress = () => {
        router.push({
            pathname: "/product-detail/productId/[productId]",
            params: {
                productId: product.id,
            },
        });
    };


    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handlePress}
            className="my-4"
        >
            <View
                style={styles.container}
                className="w-[95%] rounded-lg bg-input self-center overflow-hidden"
            >
                <Image
                    source={{
                        uri: product.images[0]?.url || "https://via.placeholder.com/150",
                    }}
                    className="w-full h-full object-cover"
                />
            </View>
            <View className="bg-background w-[95%] self-center p-2 rounded-b-lg">
                <View className="flex-row justify-between">
                    <Text
                        className="text-primary text-base font-poppins-medium flex-1"
                        numberOfLines={1}
                    >
                        {product.name}
                    </Text>
                    <Text className="text-primary text-base font-poppins-bold">
                        ₦{product?.price}
                    </Text>
                </View>
                <View className="flex-row justify-between mt-1">
                    <View className="flex-row gap-2 items-center">
                        <Store size={16} color="gray" />
                        <Text className="text-muted text-sm font-poppins">
                            {product?.store_name}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                        {product?.total_sold > 0 && <Text className="text-muted text-sm font-poppins">Sold: {product.total_sold}</Text>}
                        <Text className="text-muted text-sm font-poppins">Available: {product.stock || 0}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ProductCard;







const styles = StyleSheet.create({
    container: {
        height: CARD_HEIGHT,
    },

});