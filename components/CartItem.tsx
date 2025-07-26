
import { CartItem, useCartStore } from "@/store/cartStore";
import { AntDesign } from "@expo/vector-icons";
import { Trash } from "lucide-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";

type CartItemProps = {
    item: CartItem;
};

const Item = ({ item }: CartItemProps) => {
    const { updateItemQuantity, removeItem } = useCartStore();


    return (
        <View
            className="p-3 bg-input rounded-lg my-1 w-[90%] self-center flex-row justify-between"

        >
            <View className="flex-row flex-1">
                {/* Left side: Image */}
                <View className="rounded-lg w-20 h-20 overflow-hidden">
                    <Image
                        source={{ uri: item.image }}

                        style={{
                            width: '100%',
                            height: '100%',
                        }}

                    />
                </View>

                {/* Middle: Name and Price */}
                <View className="flex-1 ml-2 justify-between">
                    <View>
                        <Text className="text-primary font-poppins" numberOfLines={2}>
                            {item.name}
                        </Text>
                        <Text className="text-primary mt-1 font-poppins">
                            ₦{item.price?.toLocaleString()}
                        </Text>
                    </View>
                    {/* Bottom Right: Quantity Controls */}
                    <View className="flex-row items-center gap-3 self-end">
                        <TouchableOpacity
                            onPress={() => updateItemQuantity(item.item_id, item.quantity - 1)}
                        >
                            <AntDesign name="minuscircleo" size={20} color="#aaa" />
                        </TouchableOpacity>
                        <Text className="text-primary font-poppins text-lg">{item.quantity}</Text>
                        <TouchableOpacity
                            onPress={() => updateItemQuantity(item.item_id, item.quantity + 1)}
                        >
                            <AntDesign name="pluscircleo" size={20} color="#aaa" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => removeItem(item.item_id)}
                            style={{ marginLeft: 10 }}
                        >
                            <Trash size={20} color="#aaa" />
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    );
};

export default Item;