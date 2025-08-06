
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    ScrollView,
    View
} from "react-native";


import { fetchCategories } from "@/api/item";
import { createProduct, fetchProduct, updateProduct } from "@/api/product";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import ColorPickerInput from "@/components/ColorPickerInput";
import AppVariantButton from "@/components/core/AppVariantButton";
import ImagePickerInput from "@/components/ImagePickerInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Notifier, NotifierComponents } from "react-native-notifier";
import z from "zod";



// Zod enum for ItemType
const itemTypeEnum = z.enum(["food", "package", "product", "laundry"]);

/**
 * Zod schema for item creation.
 * Note: The original interface had a duplicate 'description' key. This schema assumes
 * a single, required 'description' field.
 */
export const productCreateSchema = z.object({
    name: z.string().min(1, "Name is a required field"),

    description: z
        .string()
        .min(10, "Description must be at least 10 characters long"),

    price: z.coerce
        .number("Price must be a number")
        .positive("Price must be greater than 0"),

    // itemType: itemTypeEnum,

    category_id: z.string({ message: "Category is a required field" }),

    // For forms, we often handle images as an array of URI strings.
    images: z.array(z.string()).nonempty({
        message: "At least one image is required",
    }),

    stock: z.coerce
        .number("Stock must be a number")
        .int("Stock must be a whole number")
        .min(1, "Stock cannot be less than 1"),

    sizes: z.string().optional(),

    colors: z.array(z.string()).optional(),
});

type ProductCreateFormData = z.infer<typeof productCreateSchema>;

const AddProductScreen = () => {
    const { productId } = useLocalSearchParams<{ productId?: string }>();
    const isEditing = !!productId;
    const queryClient = useQueryClient()

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(productCreateSchema),
        defaultValues: {
            name: "",
            category_id: "",
            description: "",
            price: 0,
            stock: 0,
            sizes: "",
            // itemType: "product",
            images: [],
            colors: [],
        },
    });

    // Fetch product data if editing
    const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
        queryKey: ["product", productId],
        queryFn: () => fetchProduct(productId!),
        enabled: !!productId,
    });

    // Populate form when product data is loaded
    useEffect(() => {
        if (existingProduct) {
            reset({
                name: existingProduct.name || "",
                category_id: existingProduct.category_id || "",
                description: existingProduct.description || "",
                price: existingProduct.price || 0,
                stock: existingProduct.stock || 0,
                sizes: existingProduct.sizes || "",
                // itemType: existingProduct.itemType || "product",
                images: existingProduct.images?.map(img => img.url) || [],
                colors: existingProduct.colors || [],
            });
        }
    }, [existingProduct, reset]);

    const { data: productCategories } = useQuery({
        queryKey: ["product-categories"],
        queryFn: fetchCategories,
        select: (categories) =>
            categories?.filter((category) => category.category_type === "product") || [],
    });





    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            Notifier.showNotification({
                title: "Product Created",
                description: "Product created successfully",
                Component: NotifierComponents.Alert,
                componentProps: {
                    alertType: "success",
                },
            });
            queryClient.invalidateQueries({ queryKey: ['products'] })
            router.back();

        },

        onError: (error) => {
            Notifier.showNotification({
                title: "Error",
                description: `${error.message}`,
                Component: NotifierComponents.Alert,
                componentProps: {
                    alertType: "info",
                },
            });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ productId, data }: { productId: string; data: any }) =>
            updateProduct(productId, data),
        onSuccess: () => {
            router.back();
        },
    });

    const isPending = createMutation.isPending || updateMutation.isPending;

    const onSubmit = (data: ProductCreateFormData) => {
        if (isEditing && productId) {
            updateMutation.mutate({ productId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return (
        <ScrollView className="flex-1 bg-background">

            <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value, onBlur } }) => (
                    <AppTextInput
                        label="Product Name"
                        placeholder="T-Shirt"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        errorMessage={errors.name?.message}
                        editable={!isPending}
                    />
                )}
            />
            <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value, onBlur } }) => (
                    <AppTextInput
                        label="Product Description"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        errorMessage={errors.description?.message}
                        editable={!isPending}
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

            {/*   <View className="hidden">
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
            </View>*/}
            <Controller
                control={control}
                name="category_id"
                render={({ field: { onChange, value } }) => (
                    <AppPicker

                        label="Category"
                        items={productCategories || []}
                        onValueChange={onChange}
                        value={value}
                    />
                )}
            />
            <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, value, onBlur } }) => (
                    <AppTextInput
                        label="Stock"
                        placeholder="Quantity Available"
                        onBlur={onBlur}
                        value={value?.toString()}
                        onChangeText={(text) => onChange(Number(text))}
                        errorMessage={errors.stock?.message}
                        keyboardType="numeric"
                        editable={!isPending}
                    />
                )}
            />

            <Controller
                control={control}
                name="sizes"
                render={({ field: { onChange, value, onBlur } }) => (
                    <AppTextInput
                        label="Sizes"
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        errorMessage={errors.sizes?.message}
                        editable={!isPending}
                    />
                )}
            />

            {/* Color Picker */}
            <ColorPickerInput
                control={control}
                name="colors"
                setValue={setValue}
                maxColors={8}
                disabled={isPending}
            />



            {/* Image Picker */}
            <ImagePickerInput
                control={control}
                name="images"
                maxImages={4}
                disabled={isPending}
                setValue={setValue}
                error={errors.images?.message}
            />

            {/* Submit Button */}
            <View style={{ padding: 20 }}>
                <AppVariantButton
                    label={isPending ? (isEditing ? "Updating Product..." : "Creating Product...") : (isEditing ? "Update Product" : "Create Product")}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                />
            </View>

        </ScrollView>
    );
};



export default AddProductScreen;
