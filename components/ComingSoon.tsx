import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Pressable, Text, View } from "react-native";
import AppButton from "./AppButton";

const { width, height } = Dimensions.get("window");

type ComingSoonProps = {
    visible?: boolean;
    title?: string;
    description?: string;
    ctaLabel?: string;
    onClose?: () => void;
    onCTAPress?: () => void;
};

const ComingSoon = ({
    visible = false,
    title = "Coming Soon",
    description = "We're cooking up something great. Stay tuned for premium laundry features and more.",
    ctaLabel = "Got it",
    onClose,
    onCTAPress,
}: ComingSoonProps) => {
    if (!visible) return null;

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width,
                height,
                zIndex: 999,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
            }}
        >
            {/* Backdrop */}
            <Pressable
                onPress={onClose}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width,
                    height,
                    backgroundColor: "rgba(0,0,0,0.45)",
                }}
            />

            <LinearGradient
                colors={["#0f1724", "#11203a", "rgba(17,32,58,0.85)"]}
                start={{ x: 0.2, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    width: "92%",
                    maxWidth: 680,
                    borderRadius: 16,
                    padding: 20,
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <View
                    style={{
                        width: 88,
                        height: 88,
                        borderRadius: 44,
                        backgroundColor: "rgba(255,255,255,0.06)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Text style={{ fontSize: 36, color: "#fff", lineHeight: 36 }}>✨</Text>
                </View>

                <Text
                    style={{
                        color: "#fff",
                        fontSize: 20,
                        fontFamily: "Poppins-SemiBold",
                        textAlign: "center",
                    }}
                >
                    {title}
                </Text>

                <Text
                    style={{
                        color: "rgba(255,255,255,0.85)",
                        fontSize: 14,
                        textAlign: "center",
                        marginHorizontal: 6,
                        fontFamily: "Poppins-Light",
                        lineHeight: 20,
                    }}
                >
                    {description}
                </Text>

                <View style={{ width: "100%", marginTop: 6 }}>
                    <AppButton
                        title={ctaLabel}
                        width="100%"
                        onPress={() => {
                            onCTAPress?.();
                            onClose?.();
                        }}
                        borderRadius={50}
                    />
                </View>


            </LinearGradient>
        </View>
    );
};

export default ComingSoon;