import { getBanks } from "@/api/payment";
import { updateCurrentVendorUser } from "@/api/user";
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
import DateTimePicker from "@react-native-community/datetimepicker";
import { useMutation, useQuery } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
import { Clock } from "lucide-react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { z } from "zod";

const profileSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone Number must be at least 10 digits")
    .max(13, "Phone Number must be at most 13 digits")
    .regex(phoneRegEx, "Enter a valid phone number"),
  location: z.string().min(1, "Location is required"),
  state: z.string().min(1, "Location is required"),
  bankName: z.string().min(1, "Bank Name is required"),
  accountNumber: z
    .string()
    .min(10, "Account Number must be 10 digits")
    .max(10, "Account Number must be 10 digits"),
  companyName: z.string().optional(),
  companyRegNo: z.string().optional(),
  openingHour: z.string().min(1, "Opening Hour is required"),
  closingHour: z.string().min(1, "Closing Hour is required"),
  pickupCharge: z.number().optional(),
  canPickup: z.boolean().optional(),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user, profile, setProfile } = useUserStore();
  const [showOpeningHour, setShowOpeningHour] = useState(false);
  const [showClosingHour, setShowClosingHour] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const { setOrigin } = useLocationStore();

  const { showError, showSuccess } = useToast();

  const { data } = useQuery({
    queryKey: ["banks"],
    queryFn: getBanks,
    staleTime: 72 * 60 * 60 * 1000,
  });

  const { isPending, mutate } = useMutation({
    mutationFn: updateCurrentVendorUser,
    onSuccess: async (data) => {
      await authStorage.removeProfile();
      await authStorage.storeProfile(data);
      setProfile(data);
      showSuccess("Success", "Profile Updated.");

      router.back();
      return;
    },
    onError: (error) => {
      showError("Error", error.message);
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
      openingHour: profile?.profile?.opening_hours || "",
      closingHour: profile?.profile?.closing_hours || "",
      companyName: profile?.profile?.business_name || "",
      location: profile?.profile?.business_address || "",
      bankName: profile?.profile?.bank_name || "",
      accountNumber: profile?.profile?.bank_account_number || "",
      companyRegNo: profile?.profile?.business_registration_number || "",
      phoneNumber: profile?.profile?.phone_number || "",
      state: profile?.profile?.state || "",
      canPickup: profile?.profile.can_pickup_and_deliver || isChecked,
      pickupCharge: profile?.profile.pickup_and_delivery_charge,
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
    // console.log(values)
    mutate(values);
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 bg-background mb-5">
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
              label="Phone Number"
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
              label="Company Reg No."
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
              label="Business Address"
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
              label="Company Name"
              value={field.value}
              errorMessage={errors.companyName?.message}
            />
          )}
        />

        <TouchableOpacity className="flex-row w-[90%] self-center h-10 my-2 items-center">
          <Controller
            control={control}
            name="canPickup"
            render={({ field: { value, onChange } }) => (
              <Checkbox
                style={{
                  borderWidth: 1,
                  height: 20,
                  width: 20,
                  borderRadius: 3,
                }}
                className="absolute right-2 bottom-2"
                value={value}
                hitSlop={35}
                onValueChange={onChange}
                onChange={() => setIsChecked(!isChecked)}
              />
            )}
          />

          <Text className="text-muted mb-0 self-start mt-2 font-poppins text-sm" >
            Pickup/Dropoff
          </Text>
        </TouchableOpacity>

        <Controller
          control={control}
          name="pickupCharge"
          render={({ field }) => (
            <AppTextInput
              placeholder="0.00"
              onChangeText={field.onChange}
              keyboardType="numeric"
              width={"40%"}
              label="Pickup/Dropoff Charge"
              value={field.value?.toString()}
              errorMessage={errors.pickupCharge?.message}
            />
          )}
        />

        <View className="w-[95%] flex-row items-center ">
          <View className="flex-1">
            <Controller
              control={control}
              name="openingHour"
              render={({ field }) => (
                <AppTextInput
                  editable={false}
                  placeholder="Opening Hour"
                  label="Opening Hour"
                  value={field.value}
                  onChangeText={field.onChange}
                  errorMessage={errors.openingHour?.message}
                />
              )}
            />
          </View>
          <TimeSelectorBtn onPress={() => setShowOpeningHour(true)} />
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
                  label="Closing Hour"
                  onChangeText={field.onChange}
                  errorMessage={errors.closingHour?.message}
                />
              )}
            />
          </View>

          <TimeSelectorBtn onPress={() => setShowClosingHour(true)} />
        </View>

        <Controller
          control={control}
          name="accountNumber"
          render={({ field }) => (
            <AppTextInput
              placeholder="Account Number"
              onChangeText={field.onChange}
              value={field.value}
              label="Account Number"
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
              label="Bank Name"
              value={field.value || ""}
              onValueChange={field.onChange}
            />
          )}
        />

        <AppVariantButton
          label="Update Profile"
          disabled={isPending}
          width={"90%"}
          onPress={handleSubmit(onSubmit)}
          icon={
            isPending && (
              <ActivityIndicator className="text-icon-default" size={"large"} />
            )
          }
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
                setValue("openingHour", `${hours}:${minutes}`, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
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
                setValue("closingHour", `${hours}:${minutes}`, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
              }
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

export default Profile;

const TimeSelectorBtn = ({ onPress }: { onPress: () => void }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-input rounded-md p-3 mt-6"
    >
      <Clock size={20} color={"gray"} />
    </TouchableOpacity>
  );
};
