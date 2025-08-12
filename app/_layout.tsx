import AddItemBtn from "@/components/AddItemBtn";
import AuthProvider from "@/components/AuthProvider";
import { NetworkNotifier } from "@/components/NetworkNotifier";
import { NetworkProvider } from "@/components/NetworkProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { ProductModalProvider } from "@/contexts/ProductModalContext";

import "@/global.css";
import { useCartStore } from "@/store/cartStore";
import { useLocationStore } from "@/store/locationStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import * as SymtemUI from "expo-system-ui";
import { Trash } from "lucide-react-native";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-get-random-values";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { NotifierWrapper } from "react-native-notifier";
import { OverlayProvider } from "stream-chat-expo";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // staleTime: 1000 * 60 * 5,
      // gcTime: 1000 * 60 * 30,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const { clearCart } = useCartStore();
  const { reset } = useLocationStore();

  const BG_COLOR = colorScheme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;

  const handleClearCart = () => {
    clearCart();
    reset();
  };

  const [loaded] = useFonts({
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  SymtemUI.setBackgroundColorAsync(BG_COLOR);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }
  return (
    <>
      <KeyboardProvider statusBarTranslucent={true}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <QueryClientProvider client={queryClient}>
            <OverlayProvider>
              <NotificationProvider>
                <NetworkProvider>
                  <NetworkNotifier />
                  <NotifierWrapper>
                    <AuthProvider>
                      <ProductModalProvider>
                        <Stack
                          screenOptions={{

                            headerTintColor:
                              colorScheme === "dark" ? "white" : "black",
                            headerShadowVisible: false,
                            headerStyle: {
                              backgroundColor: BG_COLOR,
                            },
                          }}

                        >
                          <Stack.Screen
                            name="(app)"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="index"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="(auth)"
                            options={{ headerShown: false }}
                          />

                          <Stack.Screen
                            name="channel"
                            options={{ headerShown: false }}
                          />
                          <Stack.Screen
                            name="delivery-detail"
                            options={{
                              headerShown: false,
                            }}
                          />
                          <Stack.Screen
                            name="restaurant-detail"
                            options={{
                              headerShown: false,
                            }}
                          />

                          <Stack.Screen
                            name="laundry-detail"
                            options={{
                              headerShown: false,
                            }}
                          />
                          <Stack.Screen
                            name="payment"
                            options={{
                              headerShown: false,
                            }}
                          />
                          <Stack.Screen
                            name="receipt/[deliveryId]"
                            options={{
                              title: "Download Receipt",
                              headerShadowVisible: false,


                            }}
                          />

                          <Stack.Screen
                            name="orderReceipt/[orderId]"
                            options={{
                              title: "Download Receipt",
                              // headerStyle: {
                              //   backgroundColor: BG_COLOR,
                              // },
                            }}
                          />
                          <Stack.Screen
                            name="notification-detail/[notificationId]"
                            options={{
                              title: "Notification Details",
                              // headerStyle: {
                              //   backgroundColor: BG_COLOR,
                              // },
                            }}
                          />
                          <Stack.Screen
                            name="report/[deliveryId]"
                            options={{
                              title: "Report an Issue",

                              headerStyle: {
                                backgroundColor: BG_COLOR,

                              },
                            }}
                          />
                          <Stack.Screen
                            name="review/[deliveryId]"
                            options={{
                              title: "Leave a Review",
                              // headerStyle: {
                              //   backgroundColor: BG_COLOR,
                              // },
                            }}
                          />
                          <Stack.Screen
                            name="cart/index"
                            options={{
                              title: "Cart",
                              headerShadowVisible: false,
                              // headerStyle: {
                              //   backgroundColor: BG_COLOR,
                              // },
                              headerRight: () => (
                                <AddItemBtn
                                  icon={<Trash size={18} color={"white"} />}
                                  label="Clear Cart"
                                  onPress={handleClearCart}
                                />
                              ),
                            }}
                          />
                          <Stack.Screen
                            name="chat/index"
                            options={{
                              title: "Messages",
                              headerShadowVisible: false,

                            }}
                          />

                          <Stack.Screen
                            name="product-detail"
                            options={{
                              headerTransparent: true,
                              headerShown: false,
                              headerStyle: {
                                backgroundColor: 'transparent',
                              },

                              title: "",
                              animation: "slide_from_bottom",


                            }}
                          />

                          <Stack.Screen
                            name="user-details"
                            options={{
                              presentation: "transparentModal",
                              animation: "slide_from_bottom",
                              headerShown: false,
                              contentStyle: {
                                backgroundColor: "rgba(0,0,0,0.7)",
                              },
                            }}
                          />
                        </Stack>
                        <ProductDetailModal />
                      </ProductModalProvider>
                    </AuthProvider>
                  </NotifierWrapper>
                </NetworkProvider>
              </NotificationProvider>
            </OverlayProvider>
          </QueryClientProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </>
  );
}
