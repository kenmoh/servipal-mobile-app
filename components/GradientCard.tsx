import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

const GradientCard = ({label, description}: {label: string, description: string}) => (
    <View className="w-[94%] self-center mt-2 rounded-2xl overflow-hidden">
        <LinearGradient
            colors={["#0000cd", "#0000ff", "#4169e1", "#4169e1", "#0000ff", "#0000cd"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ padding: 15, borderRadius: 15 }}
        >
            <Text className="text-white text-l font-poppins-semibold mb-2">
                {/*Fast & Reliable Delivery*/}
                {label}

            </Text>
            <Text className="text-white/80 text-sm font-poppins-light">
                {description}

                {/*Get your packages delivered quickly and safely. Enjoy seamless tracking and trusted service with ServiPal Delivery.*/}
            </Text>
        </LinearGradient>
    </View>
);

export default GradientCard