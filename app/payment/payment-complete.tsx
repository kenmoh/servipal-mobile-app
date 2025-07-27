import { router, useLocalSearchParams } from "expo-router";
import { Check, Download, Home, X } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const PaymentComplete = () => {
  const params = useLocalSearchParams();

  const paymentStatus = params.paymentStatus as string;
  const txRef = params.txRef as string;
  const transactionId = params.transactionId as string;

  const isSuccess = paymentStatus === "success";

  return (
    <View className="flex-1 bg-background items-center justify-center">
      {/* Status Icon */}
      <View style={styles.iconContainer}>
        {isSuccess ? (
          <Check color="white" size={40} />
        ) : (
          <X color="white" size={40} />
        )}
      </View>

      {/* Status text */}
      <view className="gap-6 items-center mt-10">
        <Text className="text-primary text-[28px] font-poppins-bold">
          {isSuccess ? "Payment Successful!" : "Payment Failed"}
        </Text>
        <Text className="text-gray-400 text-sm font-poppins text-center px-6 leading-6">
          {isSuccess
            ? "Great! Your payment has been processed successfully."
            : "Oops! There was an error processing your payment. Please try again."}
        </Text>
      </view>

      {/* Action buttons */}
      <View className="flex-row gap-4 mt-5 items-center">
        {isSuccess && (
          <TouchableOpacity
            onPressIn={() => {
              router.push({
                pathname: "/receipt/[deliveryId]",
                params: { deliveryId: txRef },
              });
            }}
          >
            <View className="border p-4 h-[120px] w-[120px] bg-input border-border-subtle rounded-md items-center justify-center">
              <Download color={"orange"} size={35} />
              <Text className="text-primary text-xs font-poppins-medium text-center mt-2">
                Download Receipt
              </Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPressIn={() => {
            router.replace({ pathname: "/delivery" });
          }}
        >
          <View className="border p-4 h-[120px] w-[120px]  bg-input border-border-subtle rounded-md items-center justify-center">
            <Home color="orange" size={35} />
            <Text className="text-primary text-xs font-poppins-medium text-center mt-2">
              Back to Home
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PaymentComplete;
