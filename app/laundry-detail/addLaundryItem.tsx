import React, {useEffect} from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {useLocalSearchParams, router} from 'expo-router'

import { createLaundryItem, updateLaundryItem } from "@/api/item";
import ImagePickerInput from "@/components/AppImagePicker";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";

import AppButton from "@/components/AppButton";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from '@/context/authContext';
import { useUserStore } from "@/store/userStore";

const itemTypeEnum = z.enum(["food", "package", "product", "laundry"]);

const itemTypeOptions = [

    { id: "laundry", name: "Laundry" },

];

const schema = z.object({
    name: z.string().min(1, "Name is a required field"),
    price: z.number().int().gt(0, "Price MUST be greater than 0").lte(999999),
    description: z.string().optional(),
    images: z.array(z.any()).nonempty({
        message: "Image is required",
    }),
});



type FormData = z.infer<typeof schema>;

const adLaundryItem = () => {
    const { user } = useUserStore()
    const {id, name, price, description, images} = useLocalSearchParams()
    const { showError, showSuccess } = useToast()

    const editing = Boolean(id)

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
            description: '',
            images: [],
        },
    });

    const queryClient = useQueryClient()


        useEffect(() => {
        if (editing, name, description, images, price) {
            reset({
                name: name || "",
                description: description || "",
                price: price || 0,
                images: images?.map((img) => img.url) || [],

            });
        }
    }, [editing, reset, id]);

    const { mutate: itemMutate, isPending: isCreating } = useMutation({
        mutationFn: createLaundryItem,
        onSuccess: () => {
            showSuccess("Success", "Item created successfully")

            reset();
            queryClient.invalidateQueries({ queryKey: ["laundryItems", user?.sub] });
            return;
        },
        onError: (error) => {
            showError("Error", error.message)

        },
    });

      const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) => updateLaundryItem(id, data),

        onSuccess: () => {
            showSuccess("Success", "Item updated successfully");
            queryClient.invalidateQueries({ queryKey: ["laundryItems"] });
            router.back();
        },
        onError: (error) => {
            showError("Error", error.message);
        },
    });


    const onSubmit = (data: FormData) => {
        if (editing && id) {
            updateMutation.mutate({ id: id as string, data });
        } else {
            itemMutate(data);
        }
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
                    </View>

                      <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppTextInput
                                placeholder="Description"
                                label="Description"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.description?.message}
                            />
                        )}
                    />

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
                        title={editing ? 'Update' : "Submit"}
                        disabled={isCreating || updateMutation.isPending}
                        icon={(isCreating || updateMutation.isPending)  && <ActivityIndicator size="small" color="white" />}
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
