import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";

import React, { useEffect, useState } from "react";

import { sendItem } from "@/api/order";
import AppButton from "@/components/AppButton";
import ImagePickerInput from "@/components/AppImagePicker";
import AppTextInput from "@/components/AppInput";
import HDivider from "@/components/HDivider";
import { useAuth } from "@/context/authContext";
import { useLocationStore } from "@/store/locationStore";
import { ImageType } from "@/types/order-types";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Clock } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { z } from "zod";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

const coordinatesSchema = z.tuple([
  z.number({ message: "Required" }).nullable(),
  z.number({ message: "Required" }).nullable(),
]);

const imageSchema = z
  .object({
    name: z.string(),
    type: z.string(),
    url: z.string(),
  })
  .transform(
    (data): ImageType => ({
      name: data.name,
      type: data.type,
      url: data.url,
    })
  );

export const sendItemSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  description: z.string().nonempty({ message: "Description is required" }),
  origin: z.string().nonempty({ message: "Origin is required" }),
  destination: z.string().nonempty({ message: "Destination is required" }),
  duration: z.string().nonempty({ message: "Duration is required" }),
  pickup_coordinates: coordinatesSchema,
  dropoff_coordinates: coordinatesSchema,
  distance: z.number({ message: "Distance is required" }),
  imageUrl: z.string().nonempty({ message: "Image is required" }),
});

type FormData = z.infer<typeof sendItemSchema>;

const ItemInfo = () => {
  // Get location data from Zustand store
  const { origin, originCoords, reset, destination, destinationCoords } =
    useLocationStore();

  const theme = useColorScheme();
  const { user } = useAuth()
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState(0);

  // Initialize form with empty values
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(sendItemSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      origin: "",
      destination: "",
      distance: 0,
      duration: "",
      pickup_coordinates: [null, null],
      dropoff_coordinates: [null, null],
    },
  });

  // State to track form values for non-editable fields
  const [formValues, setFormValues] = useState({
    origin: "",
    destination: "",
    pickup_coordinates: [null, null] as [number | null, number | null],
    dropoff_coordinates: [null, null] as [number | null, number | null],
    distance: 0,
    duration: "",
  });
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: sendItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["deliveries", user?.sub],
      });

      queryClient.invalidateQueries({
        queryKey: ["delivery", data?.delivery?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["delivery", data?.order?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
      });

      Notifier.showNotification({
        title: "Pending Payment Confirmation",
        description:
          "Delivery order create. Your order will be listed for delivery when your payment is confirmed",
        Component: NotifierComponents.Alert,
        duration: 1000,
        componentProps: {
          alertType: "info",
        },
      });
      reset();
      router.push({
        pathname: '/payment/[orderId]',
        params: {
          orderId: data?.order.id ?? "",
          deliveryId: data?.delivery?.id,
          deliveryFee: data?.delivery?.delivery_fee,
          orderNumber: data?.order?.order_number,
          deliveryType: data?.delivery?.delivery_type,
          orderItems: JSON.stringify(data?.order.order_items ?? []),
          paymentLink: data?.order.payment_link,
        },
      });
      return;
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      Notifier.showNotification({
        title: "Error",
        description: `${errorMessage}`,
        Component: NotifierComponents.Alert,
        componentProps: {
          alertType: "error",
        },
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutate(data);

  };

  // Update form from Zustand state
  useEffect(() => {
    // Only update if the values exist and are different from current values
    if (origin) {
      setValue("origin", origin);
      setFormValues((prev) => ({ ...prev, origin }));
    }

    if (destination) {
      setValue("destination", destination);
      setFormValues((prev) => ({ ...prev, destination }));
    }

    if (originCoords && originCoords.length === 2) {
      setValue(
        "pickup_coordinates",
        originCoords as [number | null, number | null]
      );
      setFormValues((prev) => ({
        ...prev,
        pickup_coordinates: originCoords as [number | null, number | null],
      }));
    }

    if (destinationCoords && destinationCoords.length === 2) {
      setValue(
        "dropoff_coordinates",
        destinationCoords as [number | null, number | null]
      );
      setFormValues((prev) => ({
        ...prev,
        dropoff_coordinates: destinationCoords as [
          number | null,
          number | null
        ],
      }));
    }
  }, [origin, destination, originCoords, destinationCoords, setValue]);

  // Fetch distance and duration when origin or destination changes
  useEffect(() => {
    const fetchAndUseTravelInfo = async () => {
      // Only proceed if we have both origin and destination
      if (!formValues.origin || !formValues.destination) {
        return;
      }

      const originQuery = encodeURIComponent(formValues.origin);
      const destinationQuery = encodeURIComponent(formValues.destination);

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

          setValue("distance", distanceValue);
          setValue("duration", durationText);
          setDistance(distanceValue);
          setDuration(durationText);

          setFormValues((prev) => ({
            ...prev,
            distance: distanceValue,
            duration: durationText,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch distance matrix:", error);
      }
    };

    fetchAndUseTravelInfo();
  }, [formValues.origin, formValues.destination]);

  // Format coordinates for display
  const formatCoords = (
    coords: [number | null, number | null] | undefined
  ): string => {
    if (!coords || !Array.isArray(coords)) return "";

    // Filter out null values and join with comma
    const validCoords = coords.filter((c) => c !== null);
    return validCoords.length === 2 ? validCoords.join(", ") : "";
  };

  return (
    <>
      <KeyboardAwareScrollView>
        <View className="px-[20px] gap-5">
          <View className="flex-row items-center gap-5" >
            <View className="w-[10px] h-[10px] rounded-[3px] bg-gray-500" />
            <Text className="text-primary text-[12px] font-poppins">
              {origin}{" "}
            </Text>
          </View>

          <View className="flex-row items-center gap-5">
            <Feather name="map-pin" color="gray" size={10} />
            <Text className="text-primary text-[12px] font-poppins">
              {destination}{" "}
            </Text>
          </View>
        <View className='flex-row gap-10'>
           <View className='flex-row gap-5 items-center'>
          <MaterialCommunityIcons
            name="road-variant"
            size={10}
            className="text-icon-default"
          />
          <Text className="text-icon-default text-[12px]">
            {distance} km
          </Text>
        </View>
        <View className="items-center flex-row items-center gap-5">
          <Clock className="text-icon-default" size={10} />

          <Text className="text-icon-default text-[12px]">
            {" "}
            {duration}{" "}
          </Text>
        </View>
         </View>
        </View>
          <HDivider />
          
        <View className="mt-5">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                placeholder="Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                placeholder="Description"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                errorMessage={errors.description?.message}
                numberOfLines={4}
              />
            )}
          />

          <Controller
            control={control}
            name="imageUrl"
            render={({ field: { onChange, value } }) => (
              <ImagePickerInput
                value={value}
                onChange={onChange}
                errorMessage={errors.imageUrl?.message?.toString()}
              />
            )}
          />

          <AppButton
            title={isPending ? "Sending Item..." : "Send Item"}
            disabled={isPending}
            width={"90%"}
            onPress={handleSubmit(onSubmit)}
            icon={isPending ? (
              <ActivityIndicator size={"large"} className="text-primary" />
            ) : (
              "Send"
            )}
          />
        </View>
      </KeyboardAwareScrollView >
    </>
  );
};

export default ItemInfo;

const styles = StyleSheet.create({});
