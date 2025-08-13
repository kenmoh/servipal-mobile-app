import AppTextInput from "@/components/AppInput";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View
} from "react-native";

import { registerApi } from "@/api/auth";
import AppPicker from "@/components/AppPicker";
import authStorage from "@/storage/authStorage";
import { phoneRegEx } from "@/types/user-types";
import { useMutation } from "@tanstack/react-query";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

// RHF & Zod imports
import AppButton from "@/components/AppButton";
import { useToast } from "@/components/ToastProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const roleData = [
  { id: "customer", name: "Customer" },
  { id: "restaurant_vendor", name: "Restaurant Service" },
  { id: "laundry_vendor", name: "Laundry Service" },
  { id: "dispatch", name: "Dispatch Service" },
];

const signUpSchema = z
  .object({
    email: z.string().email().trim().nonempty("Email is required"),
    userType: z.string().nonempty("User type is required"),
    phoneNumber: z
      .string()
      .regex(phoneRegEx, "Enter a valid phone number")
      .min(10, "Phone number must be at least 10 digits")
      .max(11, "Phone number must be at most 11 digits"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type SignUpFormValues = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const { showSuccess, showError, showInfo } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: "",
      userType: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      authStorage.storeEmail(data.email);
      showInfo("Pending Confirmation", "Please confirm your account with the code sent to your email and phone.")
      router.replace("/(auth)/confirm-account");
      return;
    },
    onError: (error) => {
      showError('Registration Failed', `${error.message}` || 'Registration failed, please try again.')
    },
  });

  const onSubmit = (values: SignUpFormValues) => {
    mutate(values);
  };

  return (
    <KeyboardAwareScrollView>
      <View className="w-full items-center content-center justify-center  bg-background">
        <View className="items-center w-[90%] mb-5">
          <Text className="self-start font-poppins-bold text-primary text-[24px] font-bold">
            Let's get you started
          </Text>
          <Text className="self-start font-poppins text-primary text-[12px] font-normal">
            Create an account
          </Text>
        </View>
        <View className="w-full">
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppTextInput
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Email"
                keyboardType="email-address"
                value={value}
                errorMessage={errors.email?.message}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                editable={!isPending}
              />
            )}
          />
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppTextInput
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="phone-pad"
                value={value}
                placeholder="Phone Number"
                errorMessage={errors.phoneNumber?.message}
                editable={!isPending}
              />
            )}
          />
          <Controller
            control={control}
            name="userType"
            render={({ field: { onChange, value } }) => (
              <AppPicker
                items={roleData}
                isBank={false}
                value={value}
                onValueChange={onChange}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppTextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                showPasswordToggle
                placeholder="Password"
                errorMessage={errors.password?.message}
                editable={!isPending}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppTextInput
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                showPasswordToggle
                placeholder="Confirm Password"
                errorMessage={errors.confirmPassword?.message}
                editable={!isPending}
              />
            )}
          />
          <View className="mt-5">
            <AppButton
              disabled={isPending}
              title={isPending ? "Registering..." : "Register"}
              icon={isPending && <ActivityIndicator size={"large"} />}
              width={"90%"}
              onPress={handleSubmit(onSubmit)}
            />
          </View>
        </View>
        <View className="items-center self-center justify-center w-[90%] mt-[30px]">
          <Text className="text-primary  font-poppins text-[14px]">
            Already have an account?{" "}
            <Text
              className="font-poppins text-[14px] text-button-primary underline"
              onPress={() => router.navigate("/sign-in")}
            >
              Login
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
    // </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
