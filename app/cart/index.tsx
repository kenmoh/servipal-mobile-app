import { createOrder } from "@/api/order";
import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import Item from "@/components/CartItem";
import RadioButton from "@/components/core/RadioButton";
import { useAuth } from "@/context/authContext";
import { useCartStore } from "@/store/cartStore";
import { useLocationStore } from "@/store/locationStore";
import { OrderFoodOLaundry } from "@/types/order-types";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";
import Animated, { FadeInUp } from "react-native-reanimated";


const Cart = () => {
    const [duration, setDuration] = useState("");
    const [distance, setDistance] = useState(0);
    const [error, setError] = useState({ origin: "", destination: "" });
    const [infoText, setInfoText] = useState("");
    const theme = useColorScheme();
    const { user } = useAuth();
    const {
        setDeliveryOption,
        cart,
        updateDuration,
        updateDistance,
        setAdditionalInfo,
        // prepareOrderForServer,
        totalCost,
    } = useCartStore();
    const {
        require_delivery,
        duration: storeDelivery,
        distance: storeDistance,
    } = useCartStore((state) => state.cart);
    const {
        setOrigin,
        setDestination,
        origin,
        destination,
        originCoords,
        destinationCoords,
    } = useLocationStore();

    useEffect(() => {
        setDeliveryOption("delivery");
    }, []);

    const handleDeliveryOptionChange = (option: "delivery" | "pickup") => {
        setDeliveryOption(option);
    };

    const prepareOrderForServer = (): OrderFoodOLaundry => {
        return {
            order_items: cart.order_items.map((item) => ({
                vendor_id: item.vendor_id,
                item_id: item.item_id,
                quantity: item.quantity,
            })),
            pickup_coordinates: originCoords || [0, 0],
            dropoff_coordinates: destinationCoords || [0, 0],
            distance: cart.distance,
            require_delivery: cart.require_delivery,
            duration: cart.duration,
            origin: origin ?? undefined,
            destination: destination ?? undefined,
            ...(cart.additional_info && { additional_info: cart.additional_info }),
        };
    };

    const orderData = prepareOrderForServer();

    const { mutate, data, isPending } = useMutation({
        mutationKey: ["createOrder", user?.sub],
        mutationFn: () => createOrder(cart.order_items[0].vendor_id, orderData),
        onSuccess: (data) => {
            router.push({
                pathname: "/payment/[orderId]",
                params: {
                    orderNumber: data?.order?.order_number,
                    deliveryType: data?.delivery?.delivery_type,
                    orderType: data?.order?.order_type,
                    paymentLink: data?.order?.payment_link,
                    orderId: data?.order?.id,
                    deliveryFee: data?.delivery?.delivery_fee,
                    orderItems: JSON.stringify(data?.order?.order_items),
                },
            });
        },
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
    });


    // Fetch distance and duration when origin or destination changes
    useEffect(() => {
        const fetchAndUseTravelInfo = async () => {
            // Only proceed if we have both origin and destination
            if (!origin || !destination) {
                return;
            }

            // Use origin from store for originQuery
            const originQuery = encodeURIComponent(origin);
            const destinationQuery = encodeURIComponent(destination);

            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationQuery}&origins=${originQuery}&units=metric&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`;

            try {
                const response = await fetch(url);
                const data = await response.json();

                const distanceText = data?.rows?.[0]?.elements?.[0]?.distance?.text;
                const durationText = data?.rows?.[0]?.elements?.[0]?.duration?.text;

                if (distanceText && durationText) {
                    const distanceValue = parseFloat(
                        distanceText.replace(/[^0-9.]/g, "")
                    );

                    setDistance(distanceValue);
                    setDuration(durationText);
                    updateDistance(distanceValue);
                    updateDuration(durationText);
                }
            } catch (error) {
                console.error("Failed to fetch distance matrix:", error);
            }
        };

        fetchAndUseTravelInfo();
    }, [origin, destination]);

    return (
        <>

            {cart?.order_items.length === 0 ? (
                <View
                    className="flex-1 items-center justify-center bg-background"

                >
                    <ShoppingCart className="text-icon-default" size={100} />
                    <Text className="text-[12px] text-center text-icon-default" >Your cart is empty!</Text>
                </View>
            ) : (
                <>
                    {/* <View className="my-1" /> */}
                    <ScrollView
                        className="bg-background"
                        contentContainerStyle={{
                            flexGrow: 1,
                            paddingBottom: 20,
                        }}
                    >
                        {cart.order_items.map((item) => (
                            <Item key={item?.item_id} item={item} />
                        ))}

                        <View
                            className="p-4 w-[90%] self-center rounded-lg flex-row justify-between items-center border border-button-primary my-5"

                        >
                            <Text className="text-icon-default" >Total</Text>
                            <Text className="font-bold text-icon-default">₦ {totalCost}</Text>
                        </View>

                        <View
                            className="gap-3t font-poppins-bold rounded-lg self-center flex-row justify-between  items-center w-[85%] mt-5"
                        >
                            <RadioButton
                                label="Delivery"
                                selected={require_delivery === "delivery"}
                                onPress={() => handleDeliveryOptionChange("delivery")}
                            />
                            <RadioButton
                                label="Pickup"
                                selected={require_delivery === "pickup"}
                                onPress={() => handleDeliveryOptionChange("pickup")}
                            />

                        </View>

                        <View className="w-full self-center">
                            <AppTextInput
                                label="Additional Information (Optional)"
                                value={infoText}
                                onChangeText={(text) => {
                                    setInfoText(text);
                                    setAdditionalInfo(text);
                                }}
                            />
                        </View>

                        {require_delivery === "delivery" && (

                            <Animated.View className='mt-5' entering={FadeInUp.duration(300).delay(300)}>

                                <View className="w-full self-center">
                                    <AppTextInput
                                        label="Pickup Location"
                                        value={origin || ""}
                                        editable={false}
                                    />
                                    <View className="my-2 w-full" />
                                    {/* <GoogleTextInput
                                    placeholder="Destination"
                                    disableScroll={true}
                                    value={destination}
                                    errorMessage={error.destination}
                                    onChangeText={() => { }}
                                    handlePress={(lat, lng, address) => {
                                        setDestination(address, [lat, lng]);
                                        setError((prev) => ({ ...prev, destination: "" }));
                                    }}
                                /> */}
                                    <View className="my-2" />
                                </View>
                            </Animated.View>
                        )
                        }
                        {(require_delivery === "delivery" && destination) && (
                            <View className="w-[85%] rounded-lg bg-input self-center my-3  p-5"


                            >
                                {/* DELIVERY INFO */}
                                <View className="flex-row">
                                    <Text className="w-[25%] text-primary font-poppins"
                                        style={{
                                            fontFamily: "Poppins-Regular",
                                            fontSize: 11,

                                            fontWeight: "bold",
                                        }}
                                    >
                                        Origin:{" "}
                                    </Text>
                                    <Text className="w-[75%] text-primary font-poppins text-sm"

                                    >
                                        {origin}
                                    </Text>
                                </View>

                                <View className="flex-row">
                                    <Text
                                        className="w-[25%] text-primary font-poppins-bold text-sm"
                                        style={{
                                            fontFamily: "Poppins-Regular",
                                            fontSize: 11,


                                        }}
                                    >
                                        Destination:{" "}
                                    </Text>
                                    <Text
                                        className="w-[75%] text-primary font-poppins text-sm"

                                    >
                                        {destination}
                                    </Text>
                                </View>


                                <View className="flex-row">
                                    <Text
                                        className="w-[25%] text-primary font-poppins-bold text-sm"

                                    >
                                        Duration:   {" "}
                                    </Text>
                                    <Text
                                        className="w-[75%] text-primary font-poppins text-sm"


                                    >
                                        {storeDelivery}
                                    </Text>
                                </View>
                                <View className="flex-row">
                                    <Text
                                        className="w-[25%] text-primary font-poppins text-sm"

                                    >
                                        Distance:{" "}
                                    </Text>
                                    <Text
                                        className="w-[75%] text-primary font-poppins text-sm"


                                    >
                                        {storeDistance} Km
                                    </Text>
                                </View>

                                <View className="flex-row">
                                    <Text
                                        className="w-[25%] text-primary font-poppins text-sm"

                                    >

                                        Additional Info:
                                    </Text>
                                    <Text
                                        className="w-[75%] text-primary font-poppins text-sm text-wrap"

                                    >
                                        {cart.additional_info}
                                    </Text>
                                </View>
                                <Text
                                    className="text-primary font-poppins text-sm"

                                >
                                    Delivery Option: {require_delivery.toUpperCase()}
                                </Text>
                            </View>
                        )}

                        <AppButton
                            disabled={isPending}
                            width={"90%"}
                            title="Proceed to Payment"
                            onPress={() => mutate()}
                            icon={isPending && <ActivityIndicator size="large" color="white" />}
                        />
                    </ScrollView>
                </>
            )}
        </>
    );
};

export default Cart;

const styles = StyleSheet.create({});