import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";

import { createCategory, createMenuItem, fetchCategories, updateItem } from "@/api/item";
import ImagePickerInput from "@/components/AppImagePicker";
import AppTextInput from "@/components/AppInput";
import AppModal from "@/components/AppModal";
import AppPicker from "@/components/AppPicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { z } from "zod";

import AppButton from "@/components/AppButton";
import { useAuth } from '@/context/authContext';
import type { FoodGroup, ItemType } from "@/types/item-types";
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const foodGroupOption = [

    { id: "appetizer", name: "Appetizer" },
    { id: "main_course", name: "Main Course" },
    { id: "dessert", name: "Dessert" },
    { id: "others", name: "Others" },

];

const schema = z.object({
    name: z.string().min(1, "Name is a required field"),
    price: z.number().int().gt(0, "Price MUST be greater than 0").lte(999999),
    description: z.string().min(1, "Ingredients is a required field"),
    category_id: z.string({ message: "Category is a required field" }),
    itemType: z.string({ message: "Item type is a required field" }),
    foodGroup: z.string({ message: "Food Group is a required field" }),
    side: z.string().optional(),
    images: z.array(z.any()).nonempty({
        message: "Image is required",
    }),
});

const categorySchema = z.object({
    name: z.string().min(1, "Category name is required"),
});

type CategoryFormData = z.infer<typeof categorySchema>;

type FormData = z.infer<typeof schema>;

const addMenu = () => {
    const [visble, setVisble] = useState(false);
    const { user } = useAuth()
    const theme = useColorScheme();
    const params = useLocalSearchParams();
    const isEditing = Boolean(params.id);

    const queryClient = useQueryClient();

    // If params are present, use them to prefill
    const paramItem = isEditing && params.name ? {
        id: params.id,
        name: params.name as string,
        description: params.description as string,
        price: Number(params.price),
        images: params.images ? (() => {
            try {
                const parsed = JSON.parse(params.images as string);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        })() : [],
        item_type: params.item_type as string,
        side: params.side ? params.side as string : '',
    } : null;


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
            description: "",
            images: [],
            category_id: "",
            side: "",
            itemType: "food",
            foodGroup: 'main_course'
        },
    });

    const {
        control: categoryControl,
        handleSubmit: handleCategorySubmit,
        formState: { errors: categoryErrors },
        reset: resetCategoryForm,
    } = useForm<CategoryFormData>({
        resolver: zodResolver(categorySchema),
        defaultValues: { name: "" },
    });

    const { data: categories } = useQuery({
        queryKey: ["food-categories"],
        queryFn: fetchCategories,
        select: (categories) => categories?.filter(category => category.category_type === "food") || []

    });



    const { mutate, isPending } = useMutation({
        mutationFn: createCategory,
        onSuccess: (data) => {
            Notifier.showNotification({
                title: "Success",
                description: "Category created successfully",
                Component: NotifierComponents.Alert,
                duration: 1000,
                componentProps: {
                    alertType: "success",
                },
            });
            setVisble(false);
            resetCategoryForm();

            queryClient.invalidateQueries({ queryKey: ['restaurantItems', user?.sub] })
            queryClient.invalidateQueries({ queryKey: ["food-categories"] });
            queryClient.invalidateQueries({ queryKey: ["product-categories"] });
            queryClient.invalidateQueries({ queryKey: ['restaurants'] })

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
            queryClient.invalidateQueries({ queryKey: ["items"] });
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

    const { mutate: updateMutate, isPending: isUpdating } = useMutation({
        mutationFn: ({ id, data }: { id: string, data: any }) => updateItem(id, data),
        onSuccess: (data) => {
            Notifier.showNotification({
                title: "Success",
                description: "Item updated successfully",
                Component: NotifierComponents.Alert,
                duration: 1000,
                componentProps: {
                    alertType: "success",
                },
            });
            reset();
            queryClient.invalidateQueries({ queryKey: ["items"] });
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

    // Prefill form when paramItem or itemData is loaded
    React.useEffect(() => {
        if (paramItem) {
            reset({
                name: paramItem.name || '',
                description: paramItem.description || '',
                price: paramItem.price || 0,
                images: paramItem.images && paramItem.images.length > 0 ? [paramItem.images[0].url] : [],
                itemType: paramItem.item_type || 'food',
                side: paramItem.side || '',
                // category_id, foodGroup left as default
            });
        }

    }, []);

    const onSubmit = (data: FormData) => {
        if (isEditing && paramItem?.id) {
            updateMutate({
                id: paramItem.id as string,
                data: {
                    name: data.name,
                    price: data.price,
                    category_id: data.category_id,
                    description: data.description,
                    images: data.images ?? [],
                    itemType: data.itemType as ItemType,
                    food_group: data.foodGroup as FoodGroup,
                    side: data.side,
                }
            });
        } else {
            itemMutate({
                ...data,
                images: data.images ?? [],
                itemType: data.itemType as ItemType,
                food_group: data.foodGroup as FoodGroup,
            });
        }
    };

    return (
        <>
            <KeyboardAwareScrollView className="bg-background" >
                <View className="mt-3 mb-8">
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

                    <Controller
                        control={control}
                        name="price"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppTextInput
                                placeholder="Price"
                                label="Price"
                                width={'50%'}
                                onBlur={onBlur}
                                onChangeText={(text) => onChange(Number(text))}
                                value={value?.toString()}
                                keyboardType="numeric"
                                errorMessage={errors.price?.message}
                            />
                        )}
                    />


                    <View className="hidden">
                        <Controller
                            control={control}
                            name="itemType"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AppTextInput
                                    label="Item Type"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.itemType?.message}
                                />
                            )}
                        />
                    </View>

                    <View>
                        <Controller
                            control={control}
                            name="foodGroup"
                            render={({ field: { onChange, value } }) => (
                                <AppPicker

                                    label="Group"
                                    items={foodGroupOption ?? []}
                                    onValueChange={onChange}
                                    value={value}
                                />
                            )}
                        />
                    </View>


                    <>
                        <Controller
                            control={control}
                            name="category_id"
                            render={({ field: { onChange, value } }) => (
                                <AppPicker

                                    label="Category"
                                    items={categories ?? []}
                                    onValueChange={onChange}
                                    value={value}
                                />
                            )}
                        />
                        <Controller
                            control={control}
                            name="description"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <AppTextInput
                                    label="Ingredients"
                                    placeholder="Ingredients"
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    value={value}
                                    errorMessage={errors.description?.message}
                                />
                            )}
                        />
                    </>


                    <Controller
                        control={control}
                        name="side"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppTextInput
                                label="Side"
                                placeholder="Side"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors.side?.message}
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
                    <View className="my-4">
                        <AppButton
                            title={(isCreating || isUpdating) ? 'Sending...' : (isEditing ? "Update" : "Submit")}


                            disabled={isCreating || isUpdating}
                            icon={(isCreating || isUpdating) && <ActivityIndicator color="#ccc" />}

                            backgroundColor={isCreating || isUpdating ? "bg-input" : "$bg-button-primary"}
                            width={"90%"}
                            onPress={handleSubmit(onSubmit)}
                        >

                        </AppButton>
                    </View>
                </View>



                <AppModal visible={visble} onClose={() => setVisble(false)}>
                    <Text style={{ fontFamily: "Poppins-Medium" }}>Add New Category</Text>
                    <Controller
                        control={categoryControl}
                        name="name"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <AppTextInput
                                placeholder="Category"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                errorMessage={categoryErrors.name?.message}
                            />
                        )}
                    />

                    <AppButton
                        title="Add Category"

                        disabled={isPending}
                        icon={isPending && <ActivityIndicator color="#ccc" />}
                        backgroundColor={isPending ? "bg-input" : "bg-button-primary"}
                        width={"90%"}
                        onPress={handleCategorySubmit((data) => {
                            mutate(data);
                        })}
                    />


                </AppModal>
            </KeyboardAwareScrollView>
        </>
    );
};

export default addMenu;

const styles = StyleSheet.create({});
