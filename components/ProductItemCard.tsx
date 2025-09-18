import { ProductResponse } from "@/types/marketplace"
import { LinearGradient } from "expo-linear-gradient"
import { router } from "expo-router"
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native"



type ItemProps = {
    item: ProductResponse
}

const ProductItemCard = ({ item }: ItemProps) => {



    return (
        <View
            style={{ borderWidth: StyleSheet.hairlineWidth }}
            className='bg-input rounded-2xl w-[45%] my-[2.5%] h-[200px] overflow-hidden  border-gray-800/25'
        >

            <TouchableOpacity onPress={() => router.push({ pathname: '/product-detail/add-product', params: { productId: item?.id } })}>

                <Image
                    source={{ uri: item?.images[0]?.url }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />



                <View className="px-3 absolute bottom-0 right-0 left-0 z-50">
                    <Text className="text-white font-poppins-bold text-base">₦ {item?.price}</Text>
                    <Text className='text-white font-poppins-light text-wrap'>{item?.name}</Text>
                </View>
                <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.gradient}
                />

            </TouchableOpacity>

        </View>
    )
}


const styles = StyleSheet.create({

    gradient: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 75,
    },
});


export default ProductItemCard;