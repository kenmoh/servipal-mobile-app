import { createOrder } from "@/api/order";
import AppTextInput from "@/components/AppInput";
import AppModal from "@/components/AppModal";
import Item from "@/components/CartItem";
import AppVariantButton from "@/components/core/AppVariantButton";
import RadioButton from "@/components/core/RadioButton";
import CurrentLocationButton from "@/components/CurrentLocationButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useToast } from "@/components/ToastProvider";
import { useCartStore } from "@/store/cartStore";
import { useLocationStore } from "@/store/locationStore";
import { useUserStore } from "@/store/userStore";
import { OrderFoodOLaundry, RequireDelivery } from "@/types/order-types";
import { formatDistanceAndTime } from "@/utils/formatCurrency";
import { getCoordinatesFromAddress } from "@/utils/geocoding";
import { getDirections } from "@/utils/map";
import { useMutation } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
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


const Cart = () => {
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState(0);
  const { isLaundry } = useLocalSearchParams();
  const [error, setError] = useState({ origin: "", destination: "" });
  const [infoText, setInfoText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useColorScheme();
  const { user, storeAddress } = useUserStore();

  const {
    setDeliveryOption,
    cart,
    updateDuration,
    updateDistance,
    setAdditionalInfo,
    // prepareOrderForServer,
    totalCost,
  } = useCartStore();
  const { toggleOneWayDelivery } = useCartStore();
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

  const { showError } = useToast()


  const handleDeliveryOptionChange = (option: RequireDelivery) => {
    setDeliveryOption(option);
    if (option === "vendor-pickup-and-dropoff") {
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
      is_one_way_delivery: cart.is_one_way_delivery,
      duration: cart.duration,
      origin: origin!,
      destination: destination ?? undefined,
      ...(cart.additional_info && { additional_info: cart.additional_info }),
    };
  };

  const orderData = prepareOrderForServer();

  const { mutate, isPending } = useMutation({
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
          // deliveryFee: data?.delivery?.delivery_fee,
          deliveryFee: data?.order?.vendor_pickup_dropoff_charge,
          orderItems: JSON.stringify(data?.order?.order_items),
        },
      });
    },
    onError: (error) => {
      showError("Error", error.message)

    },
  });
  // const { mutate: laundryMutaion, isPending: laundryIspending } = useMutation({
  //   mutationKey: ["createLaundryOrder", user?.sub],
  //   mutationFn: () => createLaunryOrder(cart.order_items[0].vendor_id, orderData),
  //   onSuccess: (data) => {
  //     router.push({
  //       pathname: "/payment/[orderId]",
  //       params: {
  //         orderNumber: data?.order?.order_number,
  //         deliveryType: data?.delivery?.delivery_type,
  //         orderType: data?.order?.order_type,
  //         paymentLink: data?.order?.payment_link,
  //         orderId: data?.order?.id,
  //         deliveryFee: data?.delivery?.delivery_fee,
  //         orderItems: JSON.stringify(data?.order?.order_items),
  //       },
  //     });
  //   },
  //   onError: (error) => {
  //     showError("Error", error.message)

  //   },
  // });


  const handleOrderCreate = () => {
    mutate()
  }

  // Fetch distance and duration when origin or destination changes
  useEffect(() => {
    const fetchAndUseTravelInfo = async () => {
      // Only proceed if we have both origin and destination
      // if (!origin || !destination) {
      //   return;
      // }
      if (!storeAddress || !destination) {
        return;
      }
      if (!storeAddress || !destinationCoords) {
        return;
      }
      // if (!originCoords || !destinationCoords) {
      //   return;
      // }


      // Use origin from store for originQuery
      // const originQuery = encodeURIComponent(storeAddress);
      // const destinationQuery = encodeURIComponent(destination);

      // const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destinationQuery}&origins=${originQuery}&units=metric&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`;

      const storeCoords = await getCoordinatesFromAddress(storeAddress)



      try {
        // const response = await fetch(url);
        // const data = await response.json();
        if (!storeCoords || !destinationCoords) {
          return;
        }
        const originTuple: [number, number] = [storeCoords.lat, storeCoords.lng];
        const { distance, duration } = await getDirections(originTuple, destinationCoords)
        // const { distance, duration } = await getDirections(originCoords, destinationCoords!)




        // const distanceText = data?.rows?.[0]?.elements?.[0]?.distance?.text;
        // const durationText = data?.rows?.[0]?.elements?.[0]?.duration?.text;

        if (distance && duration) {


          // if (distanceText && durationText) {
          //   const distanceValue = parseFloat(
          //     distanceText.replace(/[^0-9.]/g, "")
          //   );

          const { distance: formattedDistance, duration: formattedDuration } = formatDistanceAndTime(distance, duration);

          setDistance(formattedDistance);
          setDuration(formattedDistance.toString());
          updateDistance(formattedDistance);
          updateDuration(formattedDistance.toString());
          // setDistance(distanceValue);
          // setDuration(durationText);
          // updateDistance(distanceValue);
          // updateDuration(durationText);
        }
      } catch (error) {
        console.error("Failed to fetch distance matrix:", error);
      }
    };

    fetchAndUseTravelInfo();
  }, [origin, destination, storeAddress]);



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



            {isLaundry === 'true' && <View className="w-[90%] self-center my-2 flex-row items-center">
              <Checkbox
                style={{
                  borderWidth: 1,
                  height: 20,
                  width: 20,
                  borderRadius: 3,
                }}
                value={cart.is_one_way_delivery}
                hitSlop={35}
                onValueChange={() => toggleOneWayDelivery()}
              />
              <Text className="ml-3 text-muted font-poppins text-sm">Vendor pickup and delivery</Text>
            </View>}

            <View className="gap-3 font-poppins-bold rounded-lg self-center flex-row justify-between  items-center w-[85%] mt-5">
              <RadioButton
                label={"Vendor Delivery"}
                selected={require_delivery === "vendor-pickup-and-dropoff"}
                onPress={() => handleDeliveryOptionChange("vendor-pickup-and-dropoff")}
              />
              <RadioButton
                label={isLaundry === 'true' ? "Self Drop-off" : "Self Pickup"}
                selected={require_delivery === "pickup"}
                onPress={() => handleDeliveryOptionChange("pickup")}
              />
            </View>

            <View className="w-full self-center ">
              <Text className="font-poppins-light self-start text-muted ml-5">Additional Information(Optiona)</Text>
              <AppTextInput
                // label="Additional Information (Optional)"
                value={infoText}
                onChangeText={(text) => {
                  setInfoText(text);
                  setAdditionalInfo(text);
                }}
              />
            </View>

            {require_delivery === "vendor-pickup-and-dropoff" && destination && !modalVisible && (
              <View className="w-[90%] rounded-lg bg-input self-center my-3 gap-3 p-4">
                {/* DELIVERY INFO */}
                <View className="flex-row">
                  <Text
                    className="w-[25%] text-muted font-poppins-light"
                    style={{

                      fontSize: 11,

                    }}
                  >
                    Origin:{" "}
                  </Text>
                  <Text className="w-[75%] text-muted font-poppins-light text-sm">
                    {storeAddress}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text
                    className="w-[25%] text-muted font-poppins-light text-sm"

                  >
                    Dest:{" "}
                  </Text>
                  <Text className="w-[75%] text-muted font-poppins-light text-sm">
                    {destination}
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="w-[25%] text-muted font-poppins-light text-sm">
                    Duration:{" "}
                  </Text>
                  <Text className="w-[75%] text-muted font-poppins-light text-sm">
                    {storeDelivery}
                  </Text>
                </View>
                <View className="flex-row">
                  <Text className="w-[25%] text-muted font-poppins-light text-sm">
                    Distance:{" "}
                  </Text>
                  <Text className="w-[75%] text-muted font-poppins-light text-sm">
                    {storeDistance} Km
                  </Text>
                </View>

                <View className="flex-row">
                  <Text className="w-[35%] text-muted font-poppins-light text-sm">
                    Additional Info:
                  </Text>
                  <Text className="w-[75%] text-muted font-poppins-light text-sm text-wrap">
                    {cart.additional_info}
                  </Text>
                </View>
                <Text className="text-muted font-poppins-light text-sm">
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
                  onPress={handleOrderCreate}
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
                value={storeAddress || undefined}
                editable={false}
              />
              <View className="my-2 w-full" />
              <CurrentLocationButton
                onLocationSet={(address, coords) => {
                  setDestination(address, coords);

                }}
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
