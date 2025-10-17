
import { ProductResponse } from "@/types/marketplace";
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


const CARD_HEIGHT = Dimensions.get("screen").height * 0.2;
const CARD_WIDTH = Dimensions.get("screen").width * 0.45;

const ProductCard = ({ product }: { product: ProductResponse }) => {
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
            className="my-2 border border-collapse-transparent border-border-subtle overflow-hidden rounded-lg"
            style={{ width: CARD_WIDTH }}
        >
            <View
                style={styles.container}
                className="self-center overflow-hidden"
            >
                <Image
                    source={{
                        uri: product.images[0]?.url || "https://via.placeholder.com/150",
                    }}
                    className="w-full h-full object-cover"
                />
            </View>
            <View style={{ width: CARD_WIDTH }} className="bg-background p-2 self-center mt-2 rounded-b-lg">
                <View className="justify-between">
                    <Text
                        className="text-primary text-base font-poppins flex-1"
                        numberOfLines={1}
                    >
                        {product.name}
                    </Text>
                    <Text className="text-primary  text-base font-poppins-bold">
                        ₦{Number(product?.price).toLocaleString()}
                    </Text>
                </View>
                <View className="justify-between mt-1">
                    <View className="flex-row items-center gap-2">
                        {product?.total_sold > 0 && <Text className="text-secondary text-sm font-poppins">Sold: {product.total_sold}</Text>}
                        <Text className="text-secondary text-sm font-poppins">Available: {product.stock || 0}</Text>
                    </View>
                    <View className="flex-row gap-2 items-center">
                        <Store size={16} color="gray" />
                        <Text className="text-secondary text-sm flex-1 font-poppins" numberOfLines={1}>
                            {product?.store_name}
                        </Text>
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
        width: CARD_WIDTH,
    },

});