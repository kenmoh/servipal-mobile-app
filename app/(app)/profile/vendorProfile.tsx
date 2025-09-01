import { getBanks } from "@/api/payment";
import { updateCurrentVendorUser } from "@/api/user";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import AppPicker from "@/components/AppPicker";
import CurrentLocationButton from "@/components/CurrentLocationButton";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/authContext";
import authStorage from "@/storage/authStorage";
import { useLocationStore } from "@/store/locationStore";
import { phoneRegEx } from "@/types/user-types";
import { zodResolver } from "@hookform/resolvers/zod";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Clock } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Platform, ScrollView, View } from "react-native";

import { z } from "zod";

const states = [
  {
    "id": 1,
    "capital": "Umuahia",
    "name": "Abia"
  },
  {
    "id": 2,
    "capital": "Yola",
    "name": "Adamawa"
  },
  {
    "id": 3,
    "capital": "Uyo",
    "name": "Akwa Ibom"
  },
  {
    "id": 4,
    "capital": "Awka",
    "name": "Anambra"
  },
  {
    "id": 5,
    "capital": "Bauchi",
    "name": "Bauchi"
  },
  {
    "id": 6,
    "capital": "Yenagoa",
    "name": "Bayelsa"
  },
  {
    "id": 7,
    "capital": "Makurdi",
    "name": "Benue"
  },
  {
    "id": 8,
    "capital": "Maiduguri",
    "name": "Borno"
  },
  {
    "id": 9,
    "capital": "Calabar",
    "name": "Cross River"
  },
  {
    "id": 10,
    "capital": "Asaba",
    "name": "Delta"
  },
  {
    "id": 11,
    "capital": "Abakaliki",
    "name": "Ebonyi"
  },
  {
    "id": 12,
    "capital": "Benin City",
    "name": "Edo"
  },
  {
    "id": 13,
    "capital": "Ado Ekiti",
    "name": "Ekiti"
  },
  {
    "id": 14,
    "capital": "Enugu",
    "name": "Enugu"
  },
  {
    "id": 15,
    "capital": "Gombe",
    "name": "Gombe"
  },
  {
    "id": 16,
    "capital": "Owerri",
    "name": "Imo"
  },
  {
    "id": 17,
    "capital": "Dutse",
    "name": "Jigawa"
  },
  {
    "id": 18,
    "capital": "Kaduna",
    "name": "Kaduna"
  },
  {
    "id": 19,
    "capital": "Kano",
    "name": "Kano"
  },
  {
    "id": 20,
    "capital": "Katsina",
    "name": "Katsina"
  },
  {
    "id": 21,
    "capital": "Birnin Kebbi",
    "name": "Kebbi"
  },
  {
    "id": 22,
    "capital": "Lokoja",
    "name": "Kogi"
  },
  {
    "id": 23,
    "capital": "Ilorin",
    "name": "Kwara"
  },
  {
    "id": 24,
    "capital": "Ikeja",
    "name": "Lagos"
  },
  {
    "id": 25,
    "capital": "Lafia",
    "name": "Nasarawa"
  },
  {
    "id": 26,
    "capital": "Minna",
    "name": "Niger"
  },
  {
    "id": 27,
    "capital": "Abeokuta",
    "name": "Ogun"
  },
  {
    "id": 28,
    "capital": "Akure",
    "name": "Ondo"
  },
  {
    "id": 29,
    "capital": "Osogbo",
    "name": "Osun"
  },
  {
    "id": 30,
    "capital": "Ibadan",
    "name": "Oyo"
  },
  {
    "id": 31,
    "capital": "Jos",
    "name": "Plateau"
  },
  {
    "id": 32,
    "capital": "Port Harcourt",
    "name": "Rivers"
  },
  {
    "id": 33,
    "capital": "Sokoto",
    "name": "Sokoto"
  },
  {
    "id": 34,
    "capital": "Jalingo",
    "name": "Taraba"
  },
  {
    "id": 35,
    "capital": "Damaturu",
    "name": "Yobe"
  },
  {
    "id": 36,
    "capital": "Gusau",
    "name": "Zamfara"
  },
  {
    "id": 37,
    "capital": "Abuja",
    "name": "F.C.T"
  }
]

const profileSchema = z.object({
    phoneNumber: z
        .string()
        .min(10, "Phone Number must be at least 10 digits")
        .max(13, "Phone Number must be at most 13 digits")
        .regex(phoneRegEx, "Enter a valid phone number"),
    location: z.string().min(1, "Location is required"),
    state: z.string().min(1, "Location is required"),
    bankName: z.string().min(1, "Bank Name is required"),
    accountNumber: z.string().min(10, "Account Number must be 10 digits").max(10, "Account Number must be 10 digits"),
    companyName: z.string().optional(),
    companyRegNo: z.string().optional(),
    openingHour: z.string().min(1, "Opening Hour is required"),
    closingHour: z.string().min(1, "Closing Hour is required"),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {

    const { user, profile, setProfile } = useAuth();
    const [showOpeningHour, setShowOpeningHour] = useState(false);
    const [showClosingHour, setShowClosingHour] = useState(false);
    const { setOrigin } = useLocationStore();

    const { showError, showSuccess } = useToast()

    const { data } = useQuery({
        queryKey: ['banks'],
        queryFn: getBanks,
        staleTime: 72 * 60 * 60 * 1000,
    });

    const { isPending, mutate } = useMutation({
        mutationFn: updateCurrentVendorUser,
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
        formState: { errors, touchedFields },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            openingHour: profile?.profile?.opening_hours || "",
            closingHour: profile?.profile?.closing_hours || "",
            companyName: profile?.profile?.business_name || "",
            location: profile?.profile?.business_address || "",
            bankName: profile?.profile?.bank_name || "",
            accountNumber: profile?.profile?.bank_account_number || "",
            companyRegNo: profile?.profile?.business_registration_number || "",
            phoneNumber: profile?.profile?.phone_number || "",
        },
    });

    const handleLocationSet = async (
        address: string,
        coords: [number, number]
    ) => {
        setOrigin(address, coords);
        setValue("location", address, { shouldValidate: true, shouldTouch: true });
    };

    const onSubmit = (values: ProfileFormData) => {
        mutate(values);
    };

    return (
        <ScrollView className="flex-1 bg-background"

            showsVerticalScrollIndicator={false}
        >
            <View>
                <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                        <AppTextInput
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
                    name="companyRegNo"
                    render={({ field }) => (
                        <AppTextInput
                            placeholder="Company Reg No."
                            editable={profile?.profile?.business_registration_number === null}
                            onChangeText={field.onChange}
                            value={field.value}
                            errorMessage={errors.companyRegNo?.message}
                            autoCapitalize="characters"
                            autoCorrect={false}
                            autoComplete="off"
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="location"
                    render={({ field }) => (
                        <AppTextInput
                            placeholder="Business Location"
                            editable={false}
                            onChangeText={field.onChange}
                            value={field.value}
                            errorMessage={errors.location?.message}
                        />
                    )}
                />
                <CurrentLocationButton onLocationSet={handleLocationSet} />

                <Controller
                    control={control}
                    name="companyName"
                    render={({ field }) => (
                        <AppTextInput
                            placeholder="Company Name"
                            editable={profile?.profile?.business_name === null}
                            onChangeText={field.onChange}
                            autoCapitalize="words"
                            value={field.value}
                            errorMessage={errors.companyName?.message}
                        />
                    )}
                />


                <View className="w-[95%] flex-row items-center " >
                    <View className="flex-1">
                        <Controller
                            control={control}
                            name="openingHour"
                            render={({ field }) => (
                                <AppTextInput
                                    editable={false}
                                    placeholder="Opening Hour"
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    errorMessage={errors.openingHour?.message}
                                />
                            )}
                        />
                    </View>
                    <AppButton
                        width={"15%"}
                        title=""
                        onPress={() => setShowOpeningHour(true)}
                        backgroundColor="bg-profile-card"

                        icon={<Clock className="text-icon-default" />}
                    />


                </View>

                <View className="flex-row items-center w-[95%]">
                    <View className="flex-1">
                        <Controller
                            control={control}
                            name="closingHour"
                            render={({ field }) => (
                                <AppTextInput
                                    editable={false}
                                    placeholder="Closing Hour"
                                    value={field.value}
                                    onChangeText={field.onChange}
                                    errorMessage={errors.closingHour?.message}
                                />
                            )}
                        />
                    </View>
                    <AppButton
                        title=""
                        width={"15%"}

                        onPress={() => setShowClosingHour(true)}
                        backgroundColor="$cardDark"
                        icon={<Clock className="text-icon-default" />}
                    >
                    </AppButton>
                </View>

                <Controller
                    control={control}
                    name="accountNumber"
                    render={({ field }) => (
                        <AppTextInput
                            placeholder="Account Number"
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
                    render={({ field }) => (
                        <AppPicker
                            items={states || []}
                            isBank
                            value={field.value || ""}
                            onValueChange={field.onChange}
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
              
                <AppButton
                    title="Update Profile"

                    disabled={isPending}
                    backgroundColor={isPending ? "bg-profile-card" : "bg-button-primary"}
                    width={"90%"}
                    onPress={handleSubmit(onSubmit)}
                    icon={isPending && <ActivityIndicator className="text-icon-default" size={"large"} />}
                />


                {showOpeningHour && (
                    <DateTimePicker
                        testID="openinHourPicker"
                        value={
                            control._formValues.openingHour
                                ? new Date(`1970-01-01T${control._formValues.openingHour}`)
                                : new Date()
                        }
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowOpeningHour(Platform.OS === "ios");
                            if (selectedDate && event.type !== "dismissed") {
                                const hours = selectedDate
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0");
                                const minutes = selectedDate
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0");
                                setValue("openingHour", `${hours}:${minutes}`, { shouldValidate: true, shouldTouch: true });
                            }
                        }}
                    />
                )}
                {showClosingHour && (
                    <DateTimePicker
                        testID="closingHourPicker"
                        value={
                            control._formValues.closingHour
                                ? new Date(`1970-01-01T${control._formValues.closingHour}`)
                                : new Date()
                        }
                        mode="time"
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowClosingHour(Platform.OS === "ios");
                            if (selectedDate && event.type !== "dismissed") {
                                const hours = selectedDate
                                    .getHours()
                                    .toString()
                                    .padStart(2, "0");
                                const minutes = selectedDate
                                    .getMinutes()
                                    .toString()
                                    .padStart(2, "0");
                                setValue("closingHour", `${hours}:${minutes}`, { shouldValidate: true, shouldTouch: true });
                            }
                        }}
                    />
                )}
            </View>
        </ScrollView>
    );
};

export default Profile;
