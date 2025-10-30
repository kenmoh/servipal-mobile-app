import { getRiderProfile } from "@/api/user";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { RiderProps } from "@/types/user-types";
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useQuery } from "@tanstack/react-query";
import { Building, MapPin } from "lucide-react-native";
import { Ref } from "react";
import { ActivityIndicator, Image, Linking, Text, useColorScheme, View } from "react-native";
import { Easing } from "react-native-reanimated";
import AppVariantButton from "./core/AppVariantButton";
import HDivider from "./HDivider";

interface ProfileData {
    ref: Ref<BottomSheet>
    riderData?: RiderProps
    riderId?: string
    showButton: boolean
    onPress?: () => void

}

const RiderProfile = ({ ref, riderData, riderId, onPress, showButton = true }: ProfileData) => {

    const theme = useColorScheme()

    const HANDLE_INDICATOR_STYLE = theme === 'dark' ? HEADER_BG_LIGHT : HEADER_BG_DARK
    const HANDLE_STYLE = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT

    const handleCallPress = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const { data, isLoading } = useQuery({
        queryKey: ["rider-profile", riderId],
        queryFn: () => getRiderProfile(riderId as string),
        staleTime: 10 * 60 * 1000,
        enabled: !!riderId
    });


    const rider = riderData || data


    return <BottomSheet
        ref={ref}
        snapPoints={['55%']}
        index={-1}
        animateOnMount={true}
        animationConfigs={{
            duration: 500,
            easing: Easing.exp
        }}
        backgroundStyle={{
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            shadowColor: 'orange',
            shadowOffset: {
                width: 0,
                height: -4
            },
            shadowOpacity: 0.5,
            shadowRadius: 20,
            elevation: 20
        }}

        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }} style={{ flex: 1 }} handleStyle={{ backgroundColor: HANDLE_STYLE }}

    >

        {isLoading ? <BottomSheetView className="flex-1 bg-primary justify-center items-center"><ActivityIndicator size={'large'} /></BottomSheetView> : <BottomSheetView className={'bg-background flex-1'}>

            <>

                <View className="p-4 items-center flex-1 bg-background">
                    <View className="w-28 h-28 rounded-full overflow-hidden">
                        <Image src={rider?.profile_image_url} className="w-28 h-28 rounded-full" />
                    </View>
                    <Text className="text-primary font-poppins-semibold text-lg">{rider?.full_name} </Text>
                    {!showButton && <Text onPress={() => handleCallPress(rider?.phone_number!)} className="text-primary font-poppins text-sm">{rider?.phone_number} </Text>}

                    <View className="flex-row gap-31 items-center">
                        <Building color={"gray"} size={14} />
                        <Text className="text-muted font-poppins text-sm text-center"> {rider?.business_name}</Text>
                    </View>
                    <View className="flex-row gap-1 ">
                        <MapPin color={"gray"} size={14} />
                        <Text className="text-muted font-poppins text-sm text-center"> {rider?.business_address}</Text>
                    </View>
                </View>
                <HDivider />
                <View className="flex-row my-4 justify-between w-[80%] self-center">
                    <View className="items-center">
                        <Text className="text-xl font-poppins-bold text-primary">{rider?.delivery_count}</Text>
                        <Text className="font-poppins-light text-muted text-sm">Trips</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-poppins-bold text-primary">{rider?.average_rating}</Text>
                        <Text className="font-poppins-light text-muted text-sm">Rating</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-poppins-bold text-primary">{rider?.bike_number.toUpperCase()}</Text>
                        <Text className="font-poppins-light text-muted text-sm">Bike Number</Text>
                    </View>
                </View>

                {showButton && <View className=" bg-background mb-3">
                    <AppVariantButton width={'70%'} borderRadius={50} label="Book Rider" onPress={onPress} />
                </View>}

            </>

        </BottomSheetView>}
    </BottomSheet>;
}


export default RiderProfile