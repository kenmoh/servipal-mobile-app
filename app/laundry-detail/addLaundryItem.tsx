import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import { createMenuItem } from "@/api/item";
import ImagePickerInput from "@/components/AppImagePicker";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { z } from "zod";

import AppButton from "@/components/AppButton";
import { useAuth } from '@/context/authContext';

const itemTypeEnum = z.enum(["food", "package", "product", "laundry"]);

const itemTypeOptions = [

    { id: "laundry", name: "Laundry" },

];

const schema = z.object({
    name: z.string().min(1, "Name is a required field"),
    price: z.number().int().gt(0, "Price MUST be greater than 0").lte(999999),
    itemType: itemTypeEnum,
    images: z.array(z.any()).nonempty({
        message: "Image is required",
    }),
});



type FormData = z.infer<typeof schema>;

const adLaundryItem = () => {
    const { user } = useAuth()

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onBlur",
        defaultValues: {
            name: "",
            // price: 0,
            images: [],
            itemType: "laundry",
        },
    });

    const queryClient = useQueryClient()
    const { mutate: itemMutate, isPending: isCreating } = useMutation({
        mutationFn: createMenuItem,
        onSuccess: (data) => {
            Notifier.showNotification({
                title: "Success",
                description: "Item created successfully",
                Component: NotifierComponents.Alert,
                duration: 1000,
                componentProps: {
                    alertType: "success",
                },
            });
            reset();
            queryClient.invalidateQueries({ queryKey: ["laundryItems", user?.sub] });
            return;
        },
        onError: (error) => {
            Notifier.showNotification({
                title: "Error",
                description: `${error.message}`,
                Component: NotifierComponents.Alert,
                componentProps: {
                    alertType: "error",
                },
            });
        },
    });

    const onSubmit = (data: FormData) => {
        itemMutate({
            ...data,
            images: data.images ?? [],
        });
    };

    return (
        <>
            <ScrollView className="bg-background flex-1" showsVerticalScrollIndicator={false}>
                <View className="mt-3 mb-12">
                    <Controller
                        control={control}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppTextInput
                                placeholder="Name"
                                label="Name"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.name?.message}
                            />
                        )}
                    />
                    <View className="flex-row gap-5" >

                        <View className="w-[50%] ml-[10px]"  >
                            <Controller
                                control={control}
                                name="price"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <AppTextInput
                                        placeholder="Price"
                                        label="Price"
                                        onBlur={onBlur}
                                        onChangeText={(text) => onChange(Number(text))}
                                        value={value?.toString()}
                                        keyboardType="numeric"
                                        errorMessage={errors.price?.message}
                                    />
                                )}
                            />
                        </View>
                        <View className="w-[47.5%] hidden" >
                            <Controller
                                control={control}
                                name="itemType"
                                render={({ field: { onChange, value } }) => (
                                    <AppPicker
                                        isBank={true}
                                        enabled={false}
                                        label="Item Type"
                                        onValueChange={onChange}
                                        items={itemTypeOptions}
                                        value={value}
                                    />
                                )}
                            />

                        </View>


                    </View>

                    <Controller
                        control={control}
                        name="images"
                        render={({ field: { onChange, value } }) => (
                            <ImagePickerInput
                                value={value && value.length > 0 ? value[0] : null}
                                onChange={(image) => onChange(image ? [image] : [])}
                                errorMessage={errors.images?.message?.toString()}
                            />
                        )}
                    />
                    <AppButton
                        title={isCreating ? 'Submitting...' : "Submit"}
                        disabled={isCreating}
                        icon={isCreating && <ActivityIndicator size="small" color="white" />}
                        width={"90%"}
                        onPress={handleSubmit(onSubmit)}
                    />


                </View>
            </ScrollView>

        </>
    );
};

export default adLaundryItem;

const styles = StyleSheet.create({});
