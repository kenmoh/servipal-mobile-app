import { cancelDelivery } from "@/api/order";
import AppButton from "@/components/AppButton";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/authContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TextInput, useColorScheme, View } from "react-native";

import { z } from "zod";


type CancelType = {
    cancelReason: string
}

const cancelSchema = z.object({

    cancelReason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must be less than 500 characters"),
});

type CancelFormData = z.infer<typeof cancelSchema>;


const ReviewPage = () => {
    const { orderId } = useLocalSearchParams();
    const queryClient = useQueryClient();
    const theme = useColorScheme()
    const { user } = useAuth()
    const { showError, showSuccess } = useToast()

    const COLOR = theme === 'dark' ? "rgba(30, 33, 39, 0.5)" : '#ddd'
    const TEXT = theme === 'dark' ? '#fff' : '#aaa'



    const {
        control,
        handleSubmit,
        formState: { errors, isValid },

    } = useForm<CancelFormData>({
        resolver: zodResolver(cancelSchema),
        mode: "onChange",
        defaultValues: {
            cancelReason: "",
        },
    });




    const { mutate, isPending } = useMutation({
        mutationFn: async (data: CancelType) => {

            return cancelDelivery(orderId as string, { ...data, });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["order", orderId],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["orders"],
                exact: false,
            });
            queryClient.invalidateQueries({
                queryKey: ["orders", user?.sub],
                exact: false,
            });

            queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
            queryClient.refetchQueries({
                queryKey: ["orders", user?.sub],
                exact: false,
            });

            showSuccess('Order cancelled')
            router.back()
        },
        onError: (error: Error) => {
            showError("Error", error.message)

        },
    });

    const onSubmit = (data: CancelFormData) => {
        console.log(data)
        mutate(data);

    };

    return (
        <ScrollView className="bg-background flex-1 p-5" >
            <View className="w-full">

                <View className="gap-1 self-center items-center w-[90%]">
                    <Text className='self-start text-primary font-poppins'></Text>
                    <Controller
                        control={control}
                        name="cancelReason"
                        render={({ field: { onChange, value } }) => (
                            <TextInput
                                className="bg-input p-3 font-poppins text-base w-full h-20 focus:border mb-10 focus:border-orange-400"
                                placeholder="Reason for cancelling this order..."
                                value={value}
                                onChangeText={onChange}

                                placeholderTextColor={'#aaa'}
                                textAlignVertical="top"
                                numberOfLines={8}
                                multiline={true}
                                style={{
                                    // backgroundColor: COLOR,
                                    borderRadius: 8,
                                    color: TEXT,

                                    width: '100%',

                                }}
                            />
                        )}
                    />
                    {errors.cancelReason && (
                        <Text className="text-status-error font-poppins self-start">{errors.cancelReason.message}</Text>
                    )}
                </View>

            </View>

            <AppButton
                title={isPending ? "Submitting..." : "Cancel Order"}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending || !isValid}


            />



        </ScrollView>
    );
};

export default ReviewPage; 