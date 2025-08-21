import { getRiderProfile } from "@/api/user";
import AppButton from "@/components/AppButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from 'expo-router';
import { Bike, Building2Icon, MapPin, Phone, User } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.70

const Modal = () => {
    const { userId } = useLocalSearchParams()

    const { data, isLoading } = useQuery({
        queryKey: ["profile", userId],
        queryFn: () => getRiderProfile(userId as string),
        staleTime: 10 * 60 * 1000

    });


    if (isLoading) {
        return <LoadingIndicator />
    }

    const handleContentPress = (e: any) => {
        e.stopPropagation();
    }
    return (
        <Pressable style={styles.pressable} onPress={() => router.back()}>
            <View className='bg-background' style={[styles.container]}>
                <Pressable className='gap-5' onPress={handleContentPress}>
                    {/* Profile Header */}
                    <View className='items-center gap-2'>
                        <View className='h-32 w-32 rounded-full overflow-hidden'>
                            <Image className='h-full w-full' src={data?.profile_image_url as string || "https://placekitten.com/200/200"} />

                        </View>
                    </View>

                    {/* Contact Info */}
                    <View className='bg-profile-card rounded-sm p-4 gap-[15px]'>
                        <View className='flex-row items-center gap-10'>
                            <User size={20} color={'#aaa'} />
                            <Text className='text-primary font-poppins text-sm'>{data?.full_name}</Text>
                        </View>
                        <View className='flex-row items-center gap-10'>
                            <Phone size={20} color={'#aaa'} />
                            <Text className='text-primary font-poppins text-sm'>+{data?.phone_number}</Text>
                        </View>
                        <View className='flex-row items-center gap-10'>
                            <Building2Icon size={20} color={'#aaa'} />
                            <Text className='text-primary font-poppins text-sm'>{data?.business_name}</Text>
                        </View>
                        <View className='flex-row items-center gap-[10px]'>

                            <MapPin size={20} color={'#aaa'} />
                            <Text className='text-primary font-poppins text-sm'>{data?.business_address}</Text>
                        </View>
                        <View className='flex-row items-center gap-[10px]'>

                            <Bike size={20} color={'#aaa'} />
                            <Text className='text-primary font-poppins text-sm'>{data?.bike_number}</Text>
                        </View>

                    </View>

                    {/* Call and Report Button */}
                    <View className="items-center">
                        <AppButton
                            title="Call"

                            icon={<Phone color={'#aaa'} size={20} />}

                            width={'30%'}
                        />

                    </View>
                </Pressable>
            </View>
        </Pressable>
    )
}

export default Modal

// ...existing styles...

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    pressable: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'transparent',
    },
    container: {

        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: MODAL_HEIGHT,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 20,
    }
})