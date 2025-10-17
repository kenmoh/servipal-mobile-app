import AppTextInput from "@/components/AppInput";
// import { useUserStore } from "@/store/userStore";
import { loginApi } from "@/api/auth";
import AppButton from "@/components/AppButton";
import { useToast } from "@/components/ToastProvider";
import authStorage from "@/storage/authStorage";
import { useUserStore } from "@/store/userStore";
import { Login, User } from "@/types/user-types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { z } from "zod";

const signInSchema = z.object({
  username: z
    .email({ message: "Enter a valid email" })
    .nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

const SignIn = () => {
  const { showSuccess, showError, showInfo } = useToast();
  const { setUser } = useUserStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ username, password }: Login) => loginApi(username, password),
    onError: (error) => {
      showError('Login Failed', `${error.message}` || 'Login failed, please try again.')
      router.replace("/sign-in");
    },
    onSuccess: async (data) => {
      const user = jwtDecode(data?.access_token) as User;

      if (user?.account_status === "pending") {
        await authStorage.storeToken(data?.access_token);
        showInfo('Account Pending Confirmation', 'Please confirm your account with the code sent to your email and phone.')


        router.replace("/confirm-account");
        return;
      }

      if (user?.account_status === "confirmed") {
        try {
          await authStorage.storeToken(data?.access_token);
          setUser(user);
          showSuccess('Welcome!', 'Login Successful')
          router.replace("/(app)/delivery/(topTabs)");
        } catch (error) {
          throw new Error(`Error storing token: ${error}`);
        }
      }
    },
  });

  return (
    <>
      <KeyboardAwareScrollView
        className="flex-1 w-full bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View className="flex-1 mt-[70px] w-full bg-background h-[100%] items-center content-center justify-center">
          <View className="self-center w-[90%] mb-10">
            <Text className="self-start font-bold text-[20px] text-primary">
              Welcome back!
            </Text>
            <Text className="self-start font-normal text-[12px] text-primary">
              Login to continue
            </Text>
          </View>
          <View className="w-full">
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value, onBlur } }) => (
                <AppTextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  label={"Email"}
                  placeholder="email@example.com"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  errorMessage={errors.username?.message}
                  editable={!isPending}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <AppTextInput
                  label={"Password"}
                  placeholder="************"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  secureTextEntry
                  showPasswordToggle
                  errorMessage={errors.password?.message}
                  editable={!isPending}
                />
              )}
            />

            <View className="mt-10 w-[90%] self-center">
              <Text
                className="self-end font-poppins-medium font-normal mb-5 text-[14px] text-button-primary underline"
                onPress={() => router.push("./forgot-password")}
              >
                Forgot password
              </Text>
            </View>
            <AppButton
              disabled={isPending}
              width={"90%"}
              icon={
                isPending && <ActivityIndicator color="white" size={"large"} />
              }
              title={isPending ? "Logging in..." : "Login"}
              onPress={handleSubmit((values) => mutate(values))}
            />
          </View>
          <View className="items-center self-center justify-center w-[90%] mb-[30px] mt-[25px]">
            <Text className="text-primary font-normal text-[14px]">
              Don't have an account?{"   "}
              <Text
                className="font-poppins-medium text-[14px] text-button-primary underline"
                onPress={() => router.navigate("/sign-up")}
              >
                Register
              </Text>
            </Text>
          </View>

        </View>

      </KeyboardAwareScrollView>
    </>
  );
};

export default SignIn;
