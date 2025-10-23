import React, { useEffect, } from "react";
import { ActivityIndicator, View } from "react-native";

import { createMenuItem, fetchCategories, fetchItem, updateMenuItem } from "@/api/item";
import ImagePickerInput from "@/components/AppImagePicker";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";

import AppVariantButton from "@/components/core/AppVariantButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useToast } from "@/components/ToastProvider";

import { router, Stack, useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const foodGroupOption = [

    { id: "appetizer", name: "Appetizer" },
    { id: "main_course", name: "Main Course" },
    { id: "dessert", name: "Dessert" },
    { id: "others", name: "Others" },

];

const schema = z.object({
    name: z.string().min(1, "Name is a required field"),
    // price: z.number().int().gt(0, "Price MUST be greater than 0").lte(999999),
    price: z.coerce
        .number("Price must be a number")
        .positive("Price must be greater than 0"),
    description: z.string().min(1, "Ingredients is a required field"),
    category_id: z.string({ message: "Category is a required field" }),
    itemType: z.string({ message: "Item type is a required field" }),
    foodGroup: z.string({ message: "Food Group is a required field" }),
    side: z.string().optional(),
    images: z.array(z.any()).nonempty({
        message: "Image is required",
    }),
});


type MenuFormData = z.infer<typeof schema>;

const addMenu = () => {


    const { id } = useLocalSearchParams<{ id?: string }>();
    const isEditing = Boolean(id);
    const { showError, showSuccess } = useToast()

    const queryClient = useQueryClient();



    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MenuFormData>({
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



    const { data: categories } = useQuery({
        queryKey: ["food-categories"],
        queryFn: fetchCategories,
        select: (categories) => categories?.filter(category => category.category_type === "food") || []

    });

    // Fetch menu data if editing
    const { data: existingMenuItem, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["menu", id],
        queryFn: () => fetchItem(id as string),
        enabled: !!id,
    });


    useEffect(() => {
        if (existingMenuItem && isEditing) {
            reset({
                name: existingMenuItem.name || "",
                category_id: existingMenuItem.category_id || "",
                description: existingMenuItem.description || "",
                price: existingMenuItem.price || 0,
                images: existingMenuItem.images?.map((img) => img.url) || [],
                side: existingMenuItem?.side || "",
                itemType: existingMenuItem.item_type,


            });
        }
    }, [existingMenuItem, reset]);

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: MenuFormData }) => updateMenuItem(id, data),

        onSuccess: () => {
            showSuccess("Success", "Item updated successfully");
            queryClient.invalidateQueries({ queryKey: ["restaurantItems", existingMenuItem?.user_id, existingMenuItem?.food_group] });
            router.back();
        },
        onError: (error) => {
            showError("Error", error.message);
        },
    });


    const createMutation = useMutation({
        mutationFn: createMenuItem,
        onSuccess: (data) => {
            showSuccess("Success", `${data?.name} created successfully`)
            queryClient.invalidateQueries({ queryKey: ["restaurantItems", data?.user_id, data?.food_group] });
            router.back();
        },

        onError: (error) => {
            showError("Error", error.message)
        },
    });


    const onSubmit = (data: MenuFormData) => {
        if (isEditing && id) {

            updateMutation.mutate({ id, data });
        } else {

            createMutation.mutate(data);
        }
    };

    if (isLoadingProduct) {
        return <LoadingIndicator />
    }


    return (
        <>
            <KeyboardAwareScrollView className="bg-background" >
                <Stack.Screen options={{
                    title: isEditing ? 'Update Menu' : "Add Menu"

                }} />
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
                                    height={60}
                                    onBlur={onBlur}
                                    onChangeText={onChange}
                                    multiline={true}
                                    numberOfLines={4}
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
                        <AppVariantButton
                            label={isEditing ? "Update" : "Submit"}


                            disabled={createMutation.isPending || updateMutation.isPending}
                            icon={(createMutation.isPending || updateMutation.isPending) && <ActivityIndicator color="#ccc" />}


                            width={"90%"}
                            onPress={handleSubmit(onSubmit)}
                        />


                    </View>
                </View>
            </KeyboardAwareScrollView>
        </>
    );
};

export default addMenu;


