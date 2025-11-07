import HDivider from "@/components/HDivider";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { AntDesign, Feather } from "@expo/vector-icons";
import BackButton from '@/components/BackButton'
import {router} from 'expo-router'
import { Bike } from "lucide-react-native";
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    useColorScheme,
    View
} from "react-native";

interface HeaderData {
     backDrop: string
     storeId,
        companyName: string
        openingHour: string
        closingHour: string
        address: rating
        rating: number
        numberOfReviews: number
        profileImage: string
        delivery: boolean
}

const StoreHeader = ({ backDrop,
        storeId,
        companyName,
        openingHour,
        closingHour,
        address,
        rating,
        numberOfReviews,
        profileImage,
        delivery}: HeaderData) => {


    return (
        <>
     
        <View className="bg-background mb-[-15px]">
             

            
                <View className="bg-background">
                    

                    <Image
                        src={backDrop || "https://picsum.photos/600/300.jpg"}
                        style={{
                            height: 150,
                            width: "100%",
                            objectFit: "cover",
                        }}
                    />
                    <View className="bg-background p-4">
                        <View className="absolute top-[-35px] left-[20px]">
                            <Image
                                src={profileImage || "https://picsum.photos/200/200.jpg"}
                                style={{
                                    height: 65,
                                    width: 65,
                                    borderRadius: 10,
                                    objectFit: "cover",
                                }}
                            />
                        </View>

                        <View className="mt-3">
                            <Text className="text-primary mt-4 text-sm font-poppins-semibold uppercase">
                                {companyName}
                            </Text>
                            <View className="flex-row items-center gap-2 mt-2">
                                <Feather name="map-pin" color="gray" size={12} />
                                <Text className="font-poppins text-primary text-sm flex-shrink">
                                    {address}
                                </Text>
                            </View>
                            <View className="flex-row justify-between place-items-baseline my-3">
                                <View className="flex-row items-center gap-2 ">
                                    <AntDesign name="staro" color="orange" />
                                    <Text className="text-gray-500  font-poppins text-sm">
                                        {rating}
                                    </Text>
                                </View>
                                <Text  className="text-gray-500 underline font-poppins text-sm">
                                    ({numberOfReviews} reviews)
                                </Text>
                                {delivery && <Bike color={'orange'} size={20} />}

                                <View className="flex-row gap-2 items-baseline">
                                    <AntDesign name="clockcircleo" color="gray" />
                                    <Text className="text-gray-500  font-poppins text-sm">
                                        {openingHour} - {closingHour}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </View >
            <HDivider />
            </>
    );
};

export default StoreHeader