import React from "react";

import { getBanks } from "@/api/payment";
import { updateCurrentCustomer } from "@/api/user";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import AppVariantButton from "@/components/core/AppVariantButton";
import CurrentLocationButton from "@/components/CurrentLocationButton";
import { useToast } from "@/components/ToastProvider";
import { states } from "@/constants/states";
import authStorage from "@/storage/authStorage";
import { useLocationStore } from "@/store/locationStore";
import { useUserStore } from "@/store/userStore";
import { phoneRegEx } from "@/types/user-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

const profileSchema = z.object({
    phoneNumber: z
        .string()
        .min(10, "Phone Number must be at least 10 digits")
        .max(13, "Phone Number must be at most 13 digits")
        .regex(phoneRegEx, "Enter a valid phone number"),
    location: z.string().min(1, "Location is required"),
    bankName: z.string().optional(),
    storeName: z.string().min(1, "Username is required"),
    accountNumber: z.string().optional(),
    fullName: z.string().min(1, "Full name is required"),
    state: z.string().min(1, "State is required"),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {

    const { profile, setProfile } = useUserStore();
    const { setOrigin } = useLocationStore();
    const { showError, showSuccess } = useToast()

    const { data } = useQuery({
        queryKey: ["banks"],
        queryFn: getBanks,
        staleTime: 72 * 60 * 60 * 1000,
    });

    const { isPending, mutate } = useMutation({
        mutationFn: updateCurrentCustomer,
        onSuccess: async (data) => {

            await authStorage.removeProfile();
            await authStorage.storeProfile(data);
            setProfile(data);
            showSuccess("Success", "Profile Updated.")

            router.back();
            return;
        },
        onError: (error) => {
            showError("Error", error.message)

        },
    });

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            storeName: profile?.profile?.store_name || "",
            location: profile?.profile?.business_address || "",
            bankName: profile?.profile?.bank_name || "",
            accountNumber: profile?.profile?.bank_account_number || "",
            phoneNumber: profile?.profile?.phone_number || "",
            fullName: profile?.profile?.full_name || "",
            state: profile?.profile?.state || "",
        },
    });

    const handleLocationSet = async (
        address: string,
        coords: [number, number]
    ) => {
        setOrigin(address, coords);
        setValue("location", address);
    };

    const onSubmit = (values: ProfileFormData) => {


        mutate({
            ...values,
            accountNumber: values.accountNumber ?? "",
            bankName: values.bankName ?? "",
            storeName: values.storeName ?? "",
        });
    };

    return (
        <KeyboardAwareScrollView>
            <View className="mt-5">
                <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <AppTextInput
                            label="Phone Number"
                            placeholder="Phone Number"
                            editable={false}
                            onChangeText={field.onChange}
                            value={field.value}
                            keyboardType="phone-pad"
                            autoCapitalize="none"
                            errorMessage={errors.phoneNumber?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                        <AppTextInput
                            label="Full Name"
                            placeholder="Full Name"
                            onChangeText={field.onChange}
                            autoCapitalize="words"
                            value={field.value}
                            errorMessage={errors.fullName?.message}
                        />
                    )}
                />
                <Controller
                    control={control}
                    name="storeName"
                    render={({ field }) => (
                        <AppTextInput
                            label="Username"
                            placeholder="Username"
                            onChangeText={field.onChange}
                            autoCapitalize="words"
                            value={field.value}
                            errorMessage={errors.storeName?.message}
                        />
                    )}
                />
                <CurrentLocationButton onLocationSet={handleLocationSet} />
                <Controller
                    control={control}
                    name="location"
                    render={({ field }) => (
                        <AppTextInput
                            placeholder="Address"
                            label="Address"
                            editable={false}
                            onChangeText={field.onChange}
                            value={field.value}
                            errorMessage={errors.location?.message}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="accountNumber"
                    render={({ field }) => (
                        <AppTextInput
                            placeholder="Account Number"
                            label="Account Number"
                            onChangeText={field.onChange}
                            value={field.value}
                            keyboardType={"number-pad"}
                            errorMessage={errors.accountNumber?.message}
                        />
                    )}
                />


                <Controller
                    control={control}
                    name="state"
                    render={({ field: { onChange, value } }) => (
                        <AppPicker
                            items={states}
                            isBank={false}
                            isState={true}
                            value={value}
                            onValueChange={onChange}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="bankName"
                    render={({ field }) => (
                        <AppPicker
                            items={data || []}
                            isBank
                            value={field.value || ""}
                            onValueChange={field.onChange}
                        />
                    )}
                />

                <AppVariantButton
                    label='Update Profile'
                    disabled={isPending}
                    width={"90%"}
                    onPress={handleSubmit(onSubmit)}
                    icon={isPending && <ActivityIndicator color="white" size={"large"} />}
                />


            </View>
        </KeyboardAwareScrollView>
    );
};

export default Profile;
