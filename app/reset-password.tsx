import React, { useEffect } from 'react'

import { recoverPassword } from "@/api/auth";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { useToast } from '@/components/ToastProvider';

const schema = z
  .object({
    token: z.string(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm Password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof schema>;

const ResetPassword = () => {
  const theme = useColorScheme();
  const { showSuccess, showError } = useToast();

  const { token } = useLocalSearchParams()

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      password: "",
      confirmPassword: "",
      token: token || ''
    },
  });

  useEffect(() => {
    if (token) {
      setValue('token', token);
    }
  }, [token, setValue]);

  const { mutate, isPending } = useMutation({
    mutationFn: recoverPassword,
    onError: (error) => {
      showError('Error', error.message)
    },
    onSuccess: () => {
      showSuccess('Success', 'Password reset successful')


      router.replace("/sign-in");
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data);
  };
  const bgColor = useMemo(
    () => (theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT),
    [theme]
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <ScrollView
        className="flex-1 w-full bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View className="flexx-1 bg-background w-full items-center content-center justify-center">
          <View className="items-center w-[90%] mb-10">
            <Text className="self-start text-[20px] text-primary font-poppins-bold">
              Reset password
            </Text>

            <Text className="self-start text-primary font-poppins text-xs">
              Enter new Password
            </Text>
          </View>
          <View className="gap-5 w-full">
            {/*      <View className="display-none"> 

  <Controller
            control={control}
            name="token"
            render={({ field: { onChange, value, onBlur } }) => (
              <AppTextInput
                value={token}
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
          </View>
*/}
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
            <AppButton
              title={isPending ? "Sending" : "Send"}
              disabled={isPending}
              width={"90%"}
              icon={isPending && <ActivityIndicator size={"large"} color="white" />}
              onPress={handleSubmit(onSubmit)}
            />
          </View>

          <View className="items-center self-center mt-[25px] justify-center w-[90%] mb-[30px]">
            <Text className="text-primary font-poppins text-[14px]">
              Or continue to{"  "}
              <Text
                onPress={() => router.navigate("/sign-in")}
                className="font-poppins text-[14px] text-button-primary underline"
              >
                Login
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ResetPassword;
