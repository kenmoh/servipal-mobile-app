import { resendVerification, verifyContact } from "@/api/auth";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import AppVariantButton from "@/components/core/AppVariantButton";
import { useToast } from "@/components/ToastProvider";
import authStorage from "@/storage/authStorage";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

const schema = z.object({
  emailCode: z
    .string()
    .min(6, { message: "Email code must be 6 digits" })
    .max(6, { message: "Email code must be 6 digits" })
    .regex(/^\d+$/, { message: "Email code must contain only digits" }),
  phoneCode: z
    .union([z.string(), z.number().transform((val) => val.toString())])
    .transform((val) => val.toString())
    .pipe(
      z
        .string()
        .min(6, { message: "Phone code must be 6 digits" })
        .max(6, { message: "Phone code must be 6 digits" })
        .regex(/^\d+$/, { message: "Phone code must contain only digits" })
    ),
});

type FormData = {
  emailCode: string;
  phoneCode: string | number;
};

const ConfirmAccount = () => {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const { showSuccess, showError } = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: verifyContact,
    onSuccess: () => {
      showSuccess('Success', 'Account creation successful')
      authStorage.removeEmail();
      router.replace("/sign-in");
    },
    onError: (error) => {
      showError('Error', error.message || 'An error occurred while verifying your account. Please try again later.')

    },
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: (email: string) => resendVerification(email),
    onSuccess: () => {
      showSuccess('Success', 'Verification codes sent successfully')

      setCountdown(120);
      setCanResend(false);
    },
    onError: (error) => {
      showError('Error', error.message)


    },
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => clearInterval(timer);
  }, [countdown, canResend]);

  useEffect(() => {

    authStorage.getEmail().then((e) => {
      if (e) setEmail(e);
    });

  }, []);


  console.log(email)



  const onSubmit = (data: FormData) => {
    mutate({
      ...data,
      phoneCode: data.phoneCode.toString(),
    });
  };
  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1 w-full bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View className="flex-1 w-full h-full items-center justify-center bg-background">
          <View className="w-[90%] mb-10">
            <Text className="font-poppins-bold text-primary text-2xl text-text">
              Verify your account
            </Text>
            <Text className="font-poppins  text-sm text-primary">
              Enter the code sent to your email and phone.
            </Text>
          </View>
          <Controller
            name="phoneCode"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label={"Phone Code"}
                placeholder="234534"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text)}
                value={value?.toString().trim() || ""}
                keyboardType="numeric"
                errorMessage={errors.phoneCode?.message}
                editable={!isPending}
              />
            )}
          />
          <Controller
            name="emailCode"
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label={"Email Code"}
                placeholder="123466"
                onBlur={onBlur}
                onChangeText={(text) => onChange(text)}
                value={value?.toString().trim() || ""}
                keyboardType="numeric"
                errorMessage={errors.emailCode?.message}
                editable={!isPending}
              />
            )}
          />
          <View className="flex-row self-center justify-center mt-10 w-[90%] gap-5">
            <AppButton
              width={"45%"}
              title="Submit"
              disabled={isPending}
              onPress={handleSubmit(onSubmit)}
            />
            <AppVariantButton
              outline
              width={"45%"}
              filled={false}
              label={canResend ? "Resend" : `Resend in ${countdown}s`}
              disabled={isPending}
              onPress={() => resend(email)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ConfirmAccount;
