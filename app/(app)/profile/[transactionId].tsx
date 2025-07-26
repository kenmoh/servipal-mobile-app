import AppButton from "@/components/AppButton";
import { router, useLocalSearchParams } from "expo-router";
import { CreditCard } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const TransactionDetails = () => {
    // Use theme colors from NativeWind if needed
    const {
        amount,
        date,
        status: paymentStatus,
        transactionId,
        paymentBy,
        id,
        transactionType,
        paymentLink,
        fromUser,
        toUser,

    } = useLocalSearchParams();
    const [showWebView, setShowWebView] = React.useState(false);
    const [redirectedUrl, setRedirectedUrl] = useState<{ url?: string } | null>(
        null
    );
    const status = redirectedUrl?.url
        ? redirectedUrl?.url?.split("?")[1]?.split("&")
        : null;

    const handleMakePayment = () => {
        if (!paymentLink) {
            alert("No payment link available");
            return;
        }
        setShowWebView(true);
    };

    const statusString = Array.isArray(paymentStatus) ? paymentStatus[0] : paymentStatus;

    useEffect(() => {
        if (!status) return;

        // Add status to the redirect
        if (status[0] === "status=successful") {
            router.replace({
                pathname: "/payment/payment-complete",
                params: { status: "success" },
            });
        }
        if (
            status[0] === "status=failed" ||
            status[0] === "status=cancelled"
        ) {
            router.replace({
                pathname: "/payment/payment-complete",
                params: { status: "failed" },
            });
        }
    }, [status]);

    if (showWebView && paymentLink) {
        return (
            <View className="flex-1">
                <View className="p-4">
                    <Text className="text-lg font-bold text-primary mb-2">Complete Payment</Text>
                    <AppButton title="Close" onPress={() => setShowWebView(false)} />
                </View>
                <WebView
                    style={styles.webview}
                    onNavigationStateChange={setRedirectedUrl}
                    source={{
                        uri: Array.isArray(paymentLink)
                            ? paymentLink[0]
                            : (paymentLink as string),
                    }}
                />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background p-5 my-4 gap-5">
            <View className="rounded-2xl border border-border-subtle bg-surface-profile p-3 w-full max-w-[400px] self-center">
                <Text className="text-lg text-muted mb-2">Transaction Details</Text>
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base text-muted">Amount:</Text>
                    <Text className="text-2xl font-bold text-primary">₦{Number(amount).toLocaleString()}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base text-muted">Date:</Text>
                    <Text className="text-sm text-primary">{date}</Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base text-muted">Status:</Text>
                    <Text className={`text-base font-bold ${statusString === "pending" ? "text-status-error" : "text-status-success"}`}>{statusString?.toUpperCase()}</Text>
                </View>
                <Text className="text-base text-muted mt-4">Transaction ID:</Text>
                <Text className="text-sm text-primary mb-2">{id || transactionId}</Text>
                {paymentBy && (
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-base text-muted">Payment By:</Text>
                        <Text className="text-base text-primary">{paymentBy}</Text>
                    </View>
                )}
                {fromUser && (
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-base text-muted">From:</Text>
                        <Text className="text-sm text-primary">{fromUser}</Text>
                    </View>
                )}
                {toUser && (
                    <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-base text-muted">To:</Text>
                        <Text className="text-sm text-primary">{toUser}</Text>
                    </View>
                )}
                <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-base text-muted">Transaction Type:</Text>
                    <Text className="text-sm text-primary">{transactionType}</Text>
                </View>
            </View>
            {paymentStatus === "pending" && (
                <AppButton
                    title="Make Payment"

                    onPress={handleMakePayment}
                    width={'97%'}
                    icon={<CreditCard size={20} color="white" />}
                />


            )}
        </View>
    );
};

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

export default TransactionDetails;
