import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import React, { useEffect, useState } from "react";

import { sendItem } from "@/api/order";
import ImagePickerInput from "@/components/AppImagePicker";
import AppTextInput from "@/components/AppInput";
import AppVariantButton from "@/components/core/AppVariantButton";
import HDivider from "@/components/HDivider";
import LoadingIndicator from "@/components/LoadingIndicator";
// import { useUserStore } from "@/store/userStore";
import { useLocationStore } from "@/store/locationStore";
import { ImageType } from "@/types/order-types";
import { formatDuration } from '@/utils/distance-cache';
import { getDirections } from "@/utils/map";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Clock } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useToast } from "@/components/ToastProvider";
import { useUserStore } from "@/store/userStore";
import { z } from "zod";

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
  riderId: z.string(),
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

  const { showError, showInfo, showSuccess } = useToast();
  const { user, riderId } = useUserStore()
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
      riderId: riderId!,
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
    riderId: "",
  });
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: sendItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
      });

      queryClient.invalidateQueries({
        queryKey: ["order", data?.delivery?.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["order", data?.order?.id],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });

      showInfo("Pending Payment Confirmation", "Delivery order create. Your order will be listed for delivery when your payment is confirmed")
      reset();
      router.push({
        pathname: '/payment/[orderId]',
        params: {
          orderId: data?.order.id ?? "",
          orderType: data?.order?.order_type,
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
      showError("Error", errorMessage)

    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data)
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
    if (riderId) {
      setValue("riderId", riderId);
      setFormValues((prev) => ({ ...prev, riderId }));
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
      if (!originCoords || !destinationCoords) return;

      try {
        const { distance, duration } = await getDirections(
          originCoords as [number, number],
          destinationCoords as [number, number]
        );

        // Convert distance meters → km
        const distanceKm = (distance / 1000).toFixed(2);

        // Convert duration seconds → hr/min format
        const durationText = formatDuration(duration);

        setValue("distance", parseFloat(distanceKm));
        setValue("duration", durationText);

        setDistance(parseFloat(distanceKm));
        setDuration(durationText);

        setFormValues((prev) => ({
          ...prev,
          distance: parseFloat(distanceKm),
          duration: durationText,
        }));
      } catch (error) {
        console.error("Failed to fetch Mapbox travel info:", error);
      }
    };

    fetchAndUseTravelInfo();
  }, [originCoords, destinationCoords]);


  // Format coordinates for display
  const formatCoords = (
    coords: [number | null, number | null] | undefined
  ): string => {
    if (!coords || !Array.isArray(coords)) return "";

    // Filter out null values and join with comma
    const validCoords = coords.filter((c) => c !== null);
    return validCoords.length === 2 ? validCoords.join(", ") : "";
  };

  if (!origin || !destination || !originCoords || !destinationCoords) {
    return <LoadingIndicator />
  }

  return (
    <>
      <KeyboardAwareScrollView>
        <View className="px-[20px] gap-3 mb-2">
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
                size={12}
                color={'gray'}
              />
              <Text className="text-primary text-[12px]">
                {distance} km
              </Text>
            </View>
            <View className="items-center flex-row gap-5">
              <Clock color="gray" size={12} />

              <Text className="text-primary text-[12px]">
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
                // imageHeight={1000}
                iconSize={50}
                value={value}
                onChange={onChange}
                errorMessage={errors.imageUrl?.message?.toString()}
              />
            )}
          />


          <View className="self-center w-full items-center mt-4">
            <AppVariantButton
              label="Send"
              width={'90%'}
              icon={isPending && <ActivityIndicator size={"large"} color='white' />}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            />
          </View>

        </View>
      </KeyboardAwareScrollView >
    </>
  );
};

export default ItemInfo;

const styles = StyleSheet.create({});
