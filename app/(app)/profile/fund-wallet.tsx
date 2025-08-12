import { fundWallet } from "@/api/payment";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { CreditCard } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { z } from "zod";

const fundWalletSchema = z.object({
    amount: z
        .string()
        .min(1, "Amount is required")
        .refine(
            (val) => !isNaN(Number(val)) && Number(val) > 0,
            "Enter a valid amount"
        ),
});

type FundWalletForm = z.infer<typeof fundWalletSchema>;

const FundWallet = () => {
    // Use theme colors from NativeWind if needed
    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
        watch,
    } = useForm<FundWalletForm>({
        resolver: zodResolver(fundWalletSchema),
        defaultValues: { amount: "" },
    });

    const amount = watch("amount");

    const amountTooLow = Number(amount) < 1000;
    const amountTooHigh = Number(amount) > 100_000;

    const { mutate, isPending } = useMutation({
        mutationFn: fundWallet,
        onSuccess: (data) => {
            reset();
            router.push({
                pathname: '/profile/wallet-payment',
                params: {
                    transactionId: data?.id,
                    fundWalletData: JSON.stringify(data),
                }
            });
        },
        onError: (error) => {
            Notifier.showNotification({
                title: "Error",
                description: error.message,
                Component: NotifierComponents.Alert,
                componentProps: {
                    alertType: "error",
                },
            });
        },
    });

    const onSubmit = (value: FundWalletForm) => {
        mutate({ amount: Number(value.amount) });

    };

    return (
        <View className="flex-1 bg-background items-center p-4">
            <Controller
                name="amount"
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                    <AppTextInput
                        label="Amount"
                        placeholder="Enter amount to fund wallet"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value?.toString().trim() || ""}
                        keyboardType="numeric"
                        editable={!isPending}
                        errorMessage={
                            amountTooLow
                                ? "Minimum amount is ₦1000"
                                : amountTooHigh
                                    ? "Maximum amount is ₦100,000"
                                    : errors.amount?.message
                        }
                    />
                )}
            />
            {errors.amount && (
                <Text className="text-status-error text-base mt-2">{errors.amount.message}</Text>
            )}
            <AppButton
                title={isPending ? '' : 'Fund Wallet'}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending || !!errors.amount || amountTooLow || amountTooHigh}
                icon={isPending ? <ActivityIndicator color="white" size="large" /> : <CreditCard color={'white'} />}
            />

        </View>
    );
};

export default FundWallet;
