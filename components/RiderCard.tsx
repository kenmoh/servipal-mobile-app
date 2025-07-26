import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { deleteRider } from "@/api/user";
import { useAuth } from '@/context/authContext';
import { RiderResponse } from "@/types/user-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Edit, Trash2 } from "lucide-react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import HDivider from "./HDivider";


const RiderCard = ({ rider }: { rider: RiderResponse }) => {

    const { user } = useAuth()
    const queryClient = useQueryClient();

    const { mutate: deleteRiderMutation, isPending } = useMutation({
        mutationFn: () => deleteRider(rider?.id),
        onSuccess: () => {
            // Optimistically update cache
            queryClient.setQueryData(['riders', user?.sub], (oldData: RiderResponse[] | undefined) => {
                if (!oldData) return [];
                return oldData.filter(r => r.id !== rider.id);
            });

            // Invalidate to ensure consistency
            queryClient.invalidateQueries({
                queryKey: ['riders', user?.sub],
                exact: true
            });

            Notifier.showNotification({
                title: "Rider deleted",
                description: "Rider deleted successfully.",
                Component: NotifierComponents.Alert,
                duration: 2000,
                componentProps: {
                    alertType: "success",
                },
            });
        },
        onError: (error) => {
            Notifier.showNotification({
                title: "Error deleting rider",
                description: `${error.message}`,
                Component: NotifierComponents.Alert,
                duration: 2000,
                componentProps: {
                    alertType: "error",
                },
            });
        }
    });

    return (
        <View className="bg-surface-profile rounded-xl border border-border-subtle w-[95%] self-center my-2 p-4">
            <View className="flex-row justify-between items-center">
                <View className="flex-row items-center gap-3">
                    <View className="w-16 h-16 rounded-full overflow-hidden bg-blue-500">
                        <Image
                            source={rider?.profile_image_url ? { uri: rider.profile_image_url } : require("@/assets/images/profile.jpg")}
                            style={{ width: 64, height: 64, borderRadius: 32 }}
                        />
                    </View>
                    <View>
                        <Text className="text-primary font-bold text-base">{rider.full_name}</Text>
                        <Text className="text-muted text-sm">{rider.phone_number}</Text>
                    </View>
                </View>
                <View className="gap-4 items-center">
                    <TouchableOpacity
                        onPress={() =>
                            router.push({
                                pathname: "/profile/addRider",
                                params: {
                                    riderParams: JSON.stringify(rider),
                                    isEditing: "true",
                                },
                            })
                        }
                    >
                        <Edit color="#9BA1A6" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteRiderMutation()}>
                        {isPending ? <ActivityIndicator color="#9BA1A6" size='small' /> : <Trash2 color="#9BA1A6" size={20} />}
                    </TouchableOpacity>
                </View>
            </View>
            <HDivider />
            <View className="flex-row justify-between w-full py-2">
                <View className="items-center">
                    <Text className="text-primary font-poppins text-base">{rider?.stats?.total_deliveries}</Text>
                    <Text className="text-muted text-xs font-poppins">Delivered</Text>
                </View>
                <View className="items-center">
                    <Text className="text-primary font-poppins text-base">{rider?.stats?.completed_deliveries}</Text>
                    <Text className="text-muted text-xs font-poppins">Completed</Text>
                </View>
                <View className="items-center">
                    <Text className="text-primary font-poppins text-base">{rider?.stats?.pending_deliveries}</Text>
                    <Text className="text-muted text-xs font-poppins">Pending</Text>
                </View>
                <View className="items-center">
                    <Text className="text-primary font-poppins text-base">{rider?.bike_number}</Text>
                    <Text className="text-muted text-xs font-poppins">Bike No.</Text>
                </View>
            </View>
        </View>
    );
};

export default RiderCard;

const styles = StyleSheet.create({});


