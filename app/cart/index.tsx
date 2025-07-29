import { createOrder } from "@/api/order";
import AppTextInput from "@/components/AppInput";
import AppModal from "@/components/AppModal";
import Item from "@/components/CartItem";
import AppVariantButton from "@/components/core/AppVariantButton";
import RadioButton from "@/components/core/RadioButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useAuth } from "@/context/authContext";
import { useCartStore } from "@/store/cartStore";
import { useLocationStore } from "@/store/locationStore";
import { OrderFoodOLaundry } from "@/types/order-types";
import { useMutation } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { ShoppingCart } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";

const Cart = () => {
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState(0);
  const { address } = useLocalSearchParams();
  const [error, setError] = useState({ origin: "", destination: "" });
  const [infoText, setInfoText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
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
    setDestination,
    origin,
    destination,
    originCoords,
    destinationCoords,
  } = useLocationStore();



  const handleDeliveryOptionChange = (option: "delivery" | "pickup") => {
    setDeliveryOption(option);
    if (option === "delivery") {
      setModalVisible(true);
    }
  };

  const handleNext = () => {
    setAdditionalInfo(infoText);
    setModalVisible(false);
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
      origin: address! ?? undefined,
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
        <View className="flex-1 items-center justify-center bg-background">
          <ShoppingCart color={theme === 'dark' ? 'white' : 'black'} size={100} />
          <Text className="text-[12px] text-center text-icon-default">
            Your cart is empty!
          </Text>
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

            <View className="p-4 w-[90%] self-center rounded-lg flex-row justify-between items-center border border-button-primary my-5">
              <Text className="text-icon-default">Total</Text>
              <Text className="font-bold text-icon-default">₦ {totalCost}</Text>
            </View>

            <View className="gap-3t font-poppins-bold rounded-lg self-center flex-row justify-between  items-center w-[85%] mt-5">
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

            {require_delivery === "delivery" && destination && !modalVisible && (
              <View className="w-[90%] rounded-lg bg-input self-center my-3  p-5">
                {/* DELIVERY INFO */}
                <View className="flex-row">
                  <Text
                    className="w-[25%] text-primary font-poppins"
                    style={{
                      fontFamily: "Poppins-Regular",
                      fontSize: 11,

                      fontWeight: "bold",
                    }}
                  >
                    Origin:{" "}
                  </Text>
                  <Text className="w-[75%] text-primary font-poppins text-sm">
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
                  <Text className="w-[75%] text-primary font-poppins text-sm">
                    {destination}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="w-[25%] text-primary font-poppins-bold text-sm">
                    Duration:{" "}
                  </Text>
                  <Text className="w-[75%] text-primary font-poppins text-sm">
                    {storeDelivery}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="w-[25%] text-primary font-poppins text-sm">
                    Distance:{" "}
                  </Text>
                  <Text className="w-[75%] text-primary font-poppins text-sm">
                    {storeDistance} Km
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="w-[25%] text-primary font-poppins text-sm">
                    Additional Info:
                  </Text>
                  <Text className="w-[75%] text-primary font-poppins text-sm text-wrap">
                    {cart.additional_info}
                  </Text>
                </View>
                <Text className="text-primary font-poppins text-sm">
                  Delivery Option: {require_delivery.toUpperCase()}
                </Text>
              </View>
            )}

            {!modalVisible && (
              <View className="w-full self-center items-center bg-background mb-10">
                <AppVariantButton
                  disabled={isPending}
                  width={"90%"}
                  label="Proceed to Payment"
                  onPress={() => mutate()}
                  icon={
                    isPending && <ActivityIndicator size="large" color="white" />
                  }
                />
              </View>
            )}
          </ScrollView>
          <AppModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            height="80%"
          >

            <View className="w-full self-center">
              <AppTextInput
                label="Pickup Location"
                value={address || ""}
                editable={false}
              />
              <View className="my-2 w-full" />
              <GoogleTextInput
                placeholder="Destination"

                value={destination}
                error={error.destination}
                onChangeText={() => { }}
                onPlaceSelect={(lat, lng, address) => {
                  setDestination(address, [lat, lng]);
                  setError((prev) => ({ ...prev, destination: "" }));
                }}
              />
              <View className="my-2" />
            </View>

            <View className="self-center items-center w-full">
              <AppVariantButton

                width={"90%"}
                label="Ok"


                onPress={handleNext}
              />
            </View>


          </AppModal>
        </>
      )}
    </>
  );
};

export default Cart;

const styles = StyleSheet.create({});
