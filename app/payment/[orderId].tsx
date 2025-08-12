import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

import { OrderItemResponse } from "@/types/order-types";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeftRight,
  CreditCard,
  Wallet
} from "lucide-react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";

import { payWithBankTransfer, payWithWallet } from "@/api/payment";
import AppButton from "@/components/AppButton";
import AppVariantButton from "@/components/core/AppVariantButton";
import HDivider from "@/components/HDivider";
import { useAuth } from "@/context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const Payment = () => {
  const {
    orderNumber,
    deliveryType,
    orderId,
    deliveryId,
    paymentLink,
    deliveryFee,
    orderType,
    orderItems,
  } = useLocalSearchParams();
  const theme = useColorScheme();
  const { user } = useAuth();
  const [showWebView, setShowWebView] = useState(false);
  const [redirectedUrl, setRedirectedUrl] = useState<{ url?: string } | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const status = redirectedUrl?.url
    ? redirectedUrl?.url?.split("?")[1]?.split("&")
    : null;
  const queryClient = useQueryClient();

  // Parse the stringified orderItems back to an array
  const parsedOrderItems: OrderItemResponse[] = orderItems
    ? JSON.parse(orderItems as string)
    : [];

  const handleOpenWebView = () => {
    if (!paymentLink) {
      return;
    }
    setShowWebView(true);
  };

  const { mutate, data } = useMutation({
    mutationFn: () => payWithBankTransfer(orderId as string),
    onSuccess: (data) => {
      router.replace({
        pathname: "/payment/transfer-detail",
        params: { data: JSON.stringify(data) },
      });

      Notifier.showNotification({
        title: "Bank Details",
        description: "Please make a transfer to the account details provided.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "info" },
      });
    },
    onError: (error) => {
      Notifier.showNotification({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate bank transfer.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });
  const { mutate: payWithWalletMutation, isPending } = useMutation({
    mutationFn: () => payWithWallet(orderId as string),
    onSuccess: () => {
      router.replace({
        pathname: "/payment/payment-complete",
        params: { paymentStatus: "success" },
      });

      queryClient.invalidateQueries({
        queryKey: ["order", orderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["order", orderId],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
      });

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      Notifier.showNotification({
        title: "Bank Details",
        description: "Payment successful! Your wallet has been charged.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    },
    onError: (error) => {
      router.replace({
        pathname: "/payment/payment-complete",
        params: { paymentStatus: "failed" },
      });

      Notifier.showNotification({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate bank transfer.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });

  // function to calculate total
  const calculateTotal = () => {
    const itemsTotal = parsedOrderItems.reduce((sum, item) => {
      return sum + Number(item.price) * Number(item.quantity);
    }, 0);

    return deliveryFee ? Number(deliveryFee) + itemsTotal : itemsTotal;
  };



  useEffect(() => {
    if (!status) return;

    const timer = setTimeout(() => {
      // Add paymentStatus to the redirect
      if (status[0] === "status=successful") {
        router.replace({
          pathname: "/(app)/delivery/(topTabs)",
          params: { paymentStatus: 'success' }
        });

        queryClient.invalidateQueries({
          queryKey: ["order", deliveryId],
        });
        queryClient.invalidateQueries({
          queryKey: ["order", orderId],
        });

        queryClient.invalidateQueries({
          queryKey: ["orders"],
        });

        queryClient.invalidateQueries({
          queryKey: ["orders", user?.sub],
        });

        queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
        queryClient.refetchQueries({ queryKey: ["orders", user?.sub], exact: false });

        queryClient.invalidateQueries({ queryKey: ['products', user?.sub] });
        queryClient.invalidateQueries({ queryKey: ['products'] });


      }
      if (status[0] === "status=failed" || status[0] === "status=cancelled") {
        router.replace({
          pathname: "/(app)/delivery/(topTabs)/orders",
          params: { paymentStatus: 'failed' }
        });
      }
    }, 3000); // 3-second delay

    // Cleanup the timer if the component unmounts or the status changes
    return () => clearTimeout(timer);
  }, [status]);

  const renderWebView = () => (
    <View className="bg-background" style={[styles.webviewContainer]}>
      <WebView
        style={styles.webview}
        source={{
          uri: Array.isArray(paymentLink)
            ? paymentLink[0]
            : (paymentLink as string),
        }}
        onNavigationStateChange={setRedirectedUrl}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  );

  if (showWebView) {
    return renderWebView();
  }
  const renderOrderItems = () => {
    if (deliveryType === "package") {
      return (
        <View className=" rounded-md bg-input p-4 mt-4">
          <View className="flex-row justify-center items-center">
            <Text className="text-[16px] text-primary font-poppins">
              Total Amount {' '}
            </Text>
            <Text className="font-poppins-medium text-primary text-[18px]">
              ₦{Number(deliveryFee).toFixed(2)}
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center bg-background">
        {showWebView ? (
          renderWebView()
        ) : (
          <View className="rounded-md bg-input p-4 mt-4 w-full">
            <View className="my-2">
              <HDivider />
            </View>
            {/* Add subtotal */}
            {orderType !== "package" && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-primary font-poppins">
                  Subtotal
                </Text>
                <Text className="text-sm text-primary">
                  ₦
                  {parsedOrderItems
                    .reduce(
                      (sum, item) =>
                        sum + Number(item.price) * Number(item.quantity),
                      0
                    )
                    .toFixed(2)}
                </Text>
              </View>
            )}
            {/* Add delivery fee */}
            {deliveryFee && (
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-300 text-sm">Delivery Fee</Text>
                <Text className="text-primary text-sm">
                  ₦{Number(deliveryFee).toFixed(2)}
                </Text>
              </View>
            )}
            {/* Total */}
            <View className="my-1">
              <HDivider />
            </View>

            <View className="flex-row justify-between">
              <Text className="text-[16px] text-primary font-poppins-medium">
                Total
              </Text>
              <Text className="text-[16px] text-primary font-poppins-bold">
                ₦{calculateTotal().toFixed(2)}
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4 gap-[15px]">
        {/* Header */}
        <View className="flex-row items-center gap-[10px]">
          {/* {renderIcon()} */}
          <Text className="text-[20px] font-poppins-medium text-primary">
            Payment Details
          </Text>
        </View>

        {/* Order Summary */}
        <View className="border border-border-subtle rounded-md bg-input p-4">
          <View className="gap-[10px]">
            <Text className="text-[16px] text-gray-400">
              ORDER #: {orderNumber}{" "}
            </Text>
            <Text className="text-sm text-gray-400">
              {" "}
              Order Type: {`${orderType}`.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Order Items or Package Amount */}
        {renderOrderItems()}

        {/* Payment Button */}
        <View className="mt-6">
          <Text className="text-primary text-lg mb-4 font-poppins-medium">
            Pay with:
          </Text>

          <AppButton
            onPress={handleOpenWebView}
            width={"100%"}
            title="Card"
            icon={<CreditCard size={20} color={"white"} />}
          />

          <View className="flex-row w-full justify-between my-5 self-center">


            <AppVariantButton
              filled={false}
              disabled={isPending}
              outline={true}
              onPress={() => payWithWalletMutation()}
              width={"47.5%"}
              label="Wallet"
              icon={
                isPending ? (
                  <ActivityIndicator size="small" color={"white"} />
                ) : (
                  <Wallet size={20} color={"white"} />
                )
              }
            />
            <AppVariantButton
              filled={false}

              outline={true}
              onPress={() => mutate()}
              width={"47.5%"}
              label="Transfer"
              icon={<ArrowLeftRight size={20} color={theme === 'dark' ? 'white' : 'black'} />}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Payment;

const styles = StyleSheet.create({
  webviewContainer: {
    flex: 1,
    backgroundColor: "$background",
  },
  webview: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
});
