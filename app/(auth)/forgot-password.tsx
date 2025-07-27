import { recoverPassword } from "@/api/auth";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const schema = z.object({
  email: z.email().trim(),
});

type FormData = z.infer<typeof schema>;

const RecoverPassword = () => {
  const theme = useColorScheme();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: recoverPassword,
    onError: (error) => {
      Notifier.showNotification({
        title: "Error",
        description: `${error.message}`,
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: "error",
        },
      });
    },
    onSuccess: (data) => {
      Notifier.showNotification({
        title: "Success",
        description:
          "Password reset link sent to your email. It will expire in 10 minutes.",
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: "success",
        },
      });

      router.replace("/(auth)/sign-in");
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
              Recover password
            </Text>

            <Text className="self-start text-primary font-poppins text-xs">
              Enter the email you registered with.
            </Text>
          </View>
          <View className="gap-5 w-full">
            <Controller
              name="email"
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label={"Email"}
                  placeholder="email@example.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  errorMessage={errors.email?.message}
                  editable={!isPending}
                />
              )}
            />
            <AppButton
              title={isPending ? "Sending" : "Send"}
              disabled={isPending}
              width={"90%"}
              icon={isPending && <ActivityIndicator size={"large"} />}
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

export default RecoverPassword;
