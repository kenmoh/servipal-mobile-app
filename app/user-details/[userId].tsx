import { getRiderProfile } from "@/api/user";
import AppVariantButton from "@/components/core/AppVariantButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useQuery } from "@tanstack/react-query";
import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from "expo-router";
import { Bike, Building2Icon, MapPin, Phone, User } from "lucide-react-native";
import React from "react";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

const Modal = () => {
    const { userId } = useLocalSearchParams();

    const { data, isLoading } = useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getRiderProfile(userId as string),
        staleTime: 10 * 60 * 1000,
    });

    if (isLoading) {
        return <LoadingIndicator />;
    }

    const handleCallPress = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleContentPress = (e: any) => {
        e.stopPropagation();
    };
    return (
        <Pressable style={styles.pressable} onPress={() => router.back()}>
            <View className="bg-background" style={[styles.container]}>
                <Pressable className="gap-5" onPress={handleContentPress}>
                    {/* Profile Header */}
                    <View className="items-center gap-2">
                        <View className="h-32 w-32 rounded-full overflow-hidden">
                            <Image
                                className="h-full w-full"
                                src={
                                    (data?.profile_image_url as string) ||
                                    "https://placekitten.com/200/200"
                                }
                            />
                        </View>
                    </View>

                    {/* Contact Info */}
                    <View className="bg-profile-card rounded-sm p-4 gap-[15px]">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row gap-2">
                                <User size={18} color={"orange"} />
                                <Text className="text-muted font-poppins text-sm">Name</Text>
                            </View>
                            <Text className="text-primary font-poppins text-sm">
                                {data?.full_name}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <View className="flex-row gap-2">
                                <Phone size={18} color={"orange"} />
                                <Text className="text-muted font-poppins text-sm">
                                    Phone Number
                                </Text>
                            </View>
                            <Text className="text-primary font-poppins text-sm">
                                {data?.phone_number}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <View className="flex-row justify-between gap-2">
                                <Building2Icon size={18} color={"orange"} />
                                <Text className="text-muted font-poppins text-sm">
                                    Company Name
                                </Text>
                            </View>
                            <Text className="text-primary font-poppins text-sm">
                                {data?.business_name}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <View className="flex-row gap-2">
                                <Bike size={18} color={"orange"} />
                                <Text className="text-muted font-poppins text-sm">Bike Number</Text>

                            </View>

                            <Text className="text-primary font-poppins text-sm">
                                {data?.bike_number}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <View className="flex-row gap-2">
                                <MapPin size={18} color={"orange"} />
                                <Text className="text-muted font-poppins text-sm">
                                    Company Address
                                </Text>
                            </View>

                            <Text className="text-primary font-poppins text-sm">
                                {data?.business_address}
                            </Text>
                        </View>
                    </View>

                    {/* Call and Report Button */}
                    <View className="items-center">
                        <AppVariantButton
                            label="Call"
                            icon={<Phone color={"orange"} size={20} />}
                            width={"50%"}
                            outline={true}
                            filled={false}
                            borderRadius={50}
                            onPress={() => handleCallPress(data?.phone_number as string)}

                        />
                    </View>
                </Pressable>
            </View>
        </Pressable>
    );
};

export default Modal;

// ...existing styles...

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    pressable: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "transparent",
    },
    container: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: MODAL_HEIGHT,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    },
});
