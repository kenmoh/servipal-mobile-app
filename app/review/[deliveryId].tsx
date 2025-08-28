import { createItemReview, createReview } from "@/api/review";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import { useToast } from "@/components/ToastProvider";
import { ReviewerType } from "@/types/review-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, ScrollView, Text, TextInput, useColorScheme, View } from "react-native";

import { z } from "zod";



const reviewSchema = z.object({
    orderId: z.string().optional(),
    itemId: z.string().optional(),
    revieweeId: z.string().min(1, "Reviewee ID is required"),
    reviewType: z.string().min(1, "Please select review type"),
    rating: z.number().min(1, "Please select a rating").max(5, "Rating must be between 1 and 5"),
    description: z.string().min(10, "Review must be at least 10 characters").max(500, "Review must be less than 500 characters"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const RATINGS = [
    { id: 1, name: "1 Star" },
    { id: 2, name: "2 Stars" },
    { id: 3, name: "3 Stars" },
    { id: 4, name: "4 Stars" },
    { id: 5, name: "5 Stars" },
];

const ReviewPage = () => {
    const { revieweeId, deliveryId, orderId, itemId, orderType, reviewType } = useLocalSearchParams();
    const queryClient = useQueryClient();
    const theme = useColorScheme()
    const { showError, showSuccess } = useToast()


    console.log(reviewType, "reviewType")


    const {
        control,
        handleSubmit,
        formState: { errors, isValid },

    } = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        mode: "onChange",
        defaultValues: {

            revieweeId: revieweeId as string,
            orderId: orderId as string,
            itemId: itemId as string,
            reviewType: orderType as string,
            rating: 1,
            description: "",
        },
    });



    const { mutate, isPending } = useMutation({
        mutationFn: createReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] });

            showSuccess("Success", "Review submitted successfully")

        },
        onError: (error: Error) => {
            showError("Error", error.message)

        },
    });

    const { mutate: productReviewMutation, isPending: isProductReviewPending } = useMutation({
        mutationFn: createItemReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] });

            showSuccess("Success", "Review submitted successfully")

        },
        onError: (error: Error) => {
            showError("Error", error.message)

        },
    });

    const onSubmit = (data: ReviewFormData) => {

        if (reviewType === 'product') {
            productReviewMutation({
                order_id: data.orderId,
                item_id: data.itemId,
                reviewee_id: data.revieweeId,
                rating: data.rating,
                comment: data.description,
                review_type: data.reviewType as ReviewerType,
            });
        } else {

            mutate({
                order_id: data.orderId,
                item_id: data.itemId,
                reviewee_id: data.revieweeId,
                rating: data.rating,
                comment: data.description,
                review_type: data.reviewType as ReviewerType,
            });

        }

    };

    return (
        <ScrollView className="bg-background flex-1 p-5" >
            <View className="gap-4" >


                <View className="hidden" >

                    <View className="flex-1" >
                        <Controller
                            control={control}
                            name="orderId"
                            render={({ field: { onChange, value } }) => (
                                <AppTextInput
                                    autoCapitalize="none"
                                    value={`${orderId}` || ""}
                                    editable={false}
                                    label="Order ID"
                                />
                            )}
                        />
                    </View>

                    <View className="flex-1" >
                        <Controller
                            control={control}
                            name="itemId"
                            render={({ field: { onChange, value } }) => (
                                <AppTextInput
                                    autoCapitalize="none"
                                    value={`${itemId}` || ""}
                                    editable={false}
                                    label="Item ID"
                                />
                            )}
                        />
                    </View>


                    <View>

                        <Controller
                            control={control}
                            name="revieweeId"
                            render={({ field: { onChange, value } }) => (
                                <AppTextInput
                                    autoCapitalize="none"
                                    value={`${revieweeId}`}
                                    editable={false}
                                    label="Reviewee ID"
                                />
                            )}
                        />
                    </View>
                </View>

                <View className="flex-row items-center w-full">
                    <View className="w-[70%]">
                        <Controller
                            control={control}
                            name="rating"
                            render={({ field: { onChange, value } }) => (
                                <AppPicker
                                    label="Rating"
                                    items={RATINGS}
                                    placeholder="Select rating"
                                    value={value.toString()}
                                    onValueChange={(id) => onChange(Number(id))}
                                />
                            )}
                        />
                        {errors.rating && (
                            <Text className="text-status-error text-xs mt-1"  >
                                {errors.rating.message}
                            </Text>
                        )}
                    </View>
                    <View className="w-[50%] hidden">
                        <Controller
                            control={control}
                            name="reviewType"
                            render={({ field: { onChange, value } }) => (
                                <AppTextInput

                                    label="Review Type"
                                    value={`${orderType}`}
                                    onChangeText={onChange}
                                    editable={false}
                                />
                            )}
                        />
                        {errors.reviewType && (
                            <Text className="text-status-error text-xs mt-1" >
                                {errors.reviewType.message}
                            </Text>
                        )}
                    </View>


                </View>

                <View className="w-full">
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <View className="gap-2 w-[95%] self-center ">
                                <Text className="text-sm text-primary font-poppins-bold" >
                                    Comment
                                </Text>
                                <TextInput
                                    multiline={true}

                                    numberOfLines={4}
                                    placeholder="Write your review..."
                                    value={value}
                                    placeholderTextColor={theme === "dark" ? "white" : "black"}
                                    onChangeText={onChange}
                                    className="bg-input rounded-lg text-primary"

                                />
                                {errors.description && (
                                    <Text className="text-status-error text-xs">
                                        {errors.description.message}
                                    </Text>
                                )}
                                <Text className="text-xs text-primary self-end" >
                                    {value.length}/500 characters
                                </Text>
                            </View>
                        )}
                    />
                </View>

                <AppButton
                    title={isPending ? "Submitting..." : "Submit Review"}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isPending}
                    icon={isPending && <ActivityIndicator color="white" size={'large'} />}
                />


            </View>
        </ScrollView>
    );
};

export default ReviewPage; 