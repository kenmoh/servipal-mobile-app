import { FundWalletReturn } from "@/api/payment";
import AppButton from "@/components/AppButton";
import { router, useLocalSearchParams } from "expo-router";
import { CreditCard } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";

const WalletPayment = () => {
    // Use theme colors from NativeWind if needed
    const { fundWalletData } = useLocalSearchParams();
    const fundWallet: FundWalletReturn = fundWalletData ? JSON.parse(fundWalletData as string) : null;

    const [showWebView, setShowWebView] = React.useState(false);
    const [redirectedUrl, setRedirectedUrl] = useState<{ url?: string } | null>(
        null
    );
    const status = redirectedUrl?.url
        ? redirectedUrl?.url?.split("?")[1]?.split("&")
        : null;

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

    const handleMakePayment = () => {
        if (!fundWallet.payment_link) {
            alert("No payment link available");
            return;
        }
        setShowWebView(true);
    };

    if (showWebView && fundWallet.payment_link) {
        return (
            <View className="flex-1">
                <View className="p-4">
                    <Text className="text-lg font-bold text-primary mb-2">Complete Payment</Text>
                    <AppButton icon={<CreditCard color="white" />} title={`PAY ₦${fundWallet.amount}`} onPress={() => setShowWebView(false)} />

                </View>
                <WebView
                    style={styles.webview}
                    onNavigationStateChange={setRedirectedUrl}
                    source={{
                        uri: Array.isArray(fundWallet.payment_link)
                            ? fundWallet.payment_link[0]
                            : (fundWallet.payment_link as string),
                    }}
                />
            </View>
        );
    }



    return (
        <View className="flex-1 bg-background p-6 items-center justify-center">
            <View className="rounded-2xl border border-border-subtle bg-surface-profile p-6 w-full max-w-[400px] self-center mb-8">
                <Text className="text-lg text-muted mb-2 text-center">Amount to Pay</Text>
                <Text className="text-3xl font-bold text-primary text-center">₦{Number(fundWallet?.amount).toLocaleString()}</Text>
            </View>
            <AppButton
                title="Card"
                onPress={handleMakePayment}
                icon={<CreditCard size={20} color="white" />}
            />


        </View>
    );
};




const styles = StyleSheet.create({

    webview: {
        flex: 1,
        width: Dimensions.get("window").width,
        height: Dimensions.get("window").height,
    },
});


export default WalletPayment; 