import React from "react";
import { ActivityIndicator, Platform, ScrollView, Text, TextInput, View } from "react-native";

import { createReport } from "@/api/report";
import AppButton from "@/components/AppButton";
import AppPicker from "@/components/AppPicker";
import { ReportedUserType, ReportType } from "@/types/review-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { z } from "zod";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";


const ISSUE_TYPES = [
    { id: "damage_items", name: "Damaged Items" },
    { id: "wrong_items", name: "Wrong Items" },
    { id: "late_delivery", name: "Late Delivery" },
    { id: "rider_behaviour", name: "Rider Behavior" },
    { id: "customer_behaviour", name: "Customer Behavior" },
    { id: "other", name: "Other" },
];

const REPORTED_USER_TYPE = [
    { id: "vendor", name: "Vendor" },
    { id: "customer", name: "Customer" },
    { id: "dispatch", name: "Dispatch" },
];

const reportSchema = z.object({
    reported_user_type: z.string().min(1, "Please select who you are reporting"),
    report_type: z.string().min(1, "Please select an issue type"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type ReportFormData = z.infer<typeof reportSchema>;

const ReportPage = () => {
    const { deliveryId } = useLocalSearchParams();
    const queryClient = useQueryClient();

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ReportFormData>({
        resolver: zodResolver(reportSchema),
        mode: "onBlur",
        defaultValues: {
            reported_user_type: "",
            report_type: "",
            description: "",
        },
    });

    const submitReportMutation = useMutation({
        mutationFn: async (data: ReportFormData) => {

            return createReport(deliveryId as string, {
                ...data,
                order_id: deliveryId as string,
                report_type: data.report_type as ReportType,
                reported_user_type: data.reported_user_type as ReportedUserType,
            });
        },
        onSuccess: (data) => {

            queryClient.invalidateQueries({ queryKey: ["delivery", deliveryId] });
            Notifier.showNotification({
                title: "Success",
                description: "Report submitted successfully",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "success" },
            });
            reset();
        },
        onError: (error: any) => {
            Notifier.showNotification({
                title: "Error",
                description: error?.message || "Failed to submit report",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "error" },
            });
        },
    });

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="bg-background flex-1 p-1" >
                    <View className="p-1" >
                        <View className="gap-1">
                            <Text>Issue</Text>
                            <Controller
                                control={control}
                                name="report_type"
                                render={({ field: { onChange, value } }) => (
                                    <AppPicker
                                        width="100%"
                                        items={ISSUE_TYPES}
                                        value={value}
                                        onValueChange={onChange}
                                        placeholder="Select issue type"
                                    />
                                )}
                            />
                            {errors.report_type && (
                                <Text className="text-status-error">{errors.report_type.message}</Text>
                            )}
                        </View>
                        <View className="gap-1 p-0" >
                            <Text>Against</Text>
                            <Controller
                                control={control}
                                name="reported_user_type"
                                render={({ field: { onChange, value } }) => (
                                    <AppPicker
                                        width="100%"
                                        items={REPORTED_USER_TYPE}
                                        value={value}
                                        onValueChange={onChange}
                                        placeholder="Select user type"
                                    />
                                )}
                            />
                            {errors.reported_user_type && (
                                <Text className="text-status-error">{errors.reported_user_type.message}</Text>
                            )}
                        </View>



                        <View className="gap-1">
                            <Text>Description</Text>
                            <Controller
                                control={control}
                                name="description"
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        placeholder="Please describe the issue in detail..."
                                        value={value}
                                        onChangeText={onChange}
                                        numberOfLines={4}
                                        multiline={true}
                                    />
                                )}
                            />
                            {errors.description && (
                                <Text className="text-status-error">{errors.description.message}</Text>
                            )}
                        </View>

                        <AppButton
                            title="Submit Report"
                            icon={submitReportMutation.isPending && <ActivityIndicator color="#ccc" />}
                            onPress={handleSubmit((data) => submitReportMutation.mutate(data))}
                            disabled={submitReportMutation.isPending}
                        />


                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default ReportPage; 