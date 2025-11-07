import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  TextInput
} from "react-native";

import {
  cancelDelivery,
  fetchOrder,
  riderAcceptBooking,
  riderDeclineBooking,
  riderMarkDelivered,
  riderPickupDelivery,
  senderConfirmDeliveryReceived,
} from "@/api/order";
import {
  startDeliveryTracking,
  stopDeliveryTracking,
} from "@/utils/location-tracking";

import authStorage from "@/storage/authStorage";

import AppButton from "@/components/AppButton";
import AppTextInput from "@/components/AppInput";
import AppVariantButton from "@/components/core/AppVariantButton";
import DeliveryWrapper from "@/components/DeliveryWrapper";
import { Status } from "@/components/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import RiderProfile from "@/components/RiderProfile";
import { useToast } from "@/components/ToastProvider";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useLocationStore } from "@/store/locationStore";
import { useOrderStore } from "@/store/orderStore";
import { useUserStore } from "@/store/userStore";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Sentry from '@sentry/react-native';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  DollarSignIcon,
  Info,
  MapPin,
  Phone,
  TriangleAlert,
  UserRound,
  Wallet
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

const cancelSchema = z.object({
  orderId: z.string(),
  cancelReason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must be less than 500 characters"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

const ItemDetails = () => {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme();
  const { user, setisReassign } = useUserStore();
  const { setOrigin, setDestination } = useLocationStore();
  const { setDeliveryId } = useOrderStore()
  const { showError, showSuccess, showInfo, showWarning } = useToast();
  const [modalVisible, setModalVisible] = React.useState(false);
  const isMountedRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const riderProfileRef = useRef<BottomSheet>(null)

  const HANDLE_INDICATOR_STYLE =
    theme === "dark" ? HEADER_BG_LIGHT : HEADER_BG_DARK;
  const HANDLE_STYLE = theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;
  const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT;
   const COLOR = theme === 'dark' ? "rgba(30, 33, 39, 0.5)" : '#ddd'
  const TEXT = theme === 'dark' ? '#fff' : '#aaa'

  const openSheet = () => bottomSheetRef.current?.snapToIndex(0);
  const closeSheet = () => bottomSheetRef.current?.close();
  const viewRiderProfile = () => riderProfileRef.current?.snapToIndex(0)


  const { data, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id as string),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });


  useEffect(() => {
    if (data?.delivery) {
      const { origin, destination, pickup_coordinates, dropoff_coordinates } = data.delivery;
      
      if (origin && pickup_coordinates) {
        setOrigin(origin, pickup_coordinates as [number, number]);
      }
      
      if (destination && dropoff_coordinates) {
        setDestination(destination, dropoff_coordinates as [number, number]);
      }
    }
  }, [data?.delivery, setOrigin, setDestination]);

  const handleRiderReassign = () => {
    setisReassign(true)
    setDeliveryId(data?.delivery?.id!)
    router.push('/(app)/delivery/(topTabs)')

  }


  const {
    control,
    handleSubmit,
    trigger, 
  setValue, 
  getValues,
    formState: { errors },


  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    mode: "onChange",
    defaultValues: {
      cancelReason: "",
      orderId: data?.order?.id
    },
  });

const isPickedUp = data?.delivery?.delivery_status === "picked-up" ||
                   data?.delivery?.delivery_status === "assigned" || 
                   data?.delivery?.delivery_status === "delivered" ||
                   data?.delivery?.delivery_status === "received";

  const queryClient = useQueryClient();

  const confirmReceivedMutation = useMutation({
    mutationFn: () => senderConfirmDeliveryReceived(id as string),
    onSuccess: async () => {
      // Invalidate queries first
      await queryClient.invalidateQueries({
        queryKey: ["order", data?.order?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", data?.delivery?.sender_id],
      });
      await queryClient.invalidateQueries({ queryKey: ["riders", user?.sub] })

      // Wait for refetch to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["order", id] }),
        queryClient.refetchQueries({ queryKey: ["user-orders", user?.sub] }),
      ]);
      refetch()

      // Then navigate and show success
      showSuccess("Success", "Delivery confirmed and received.");
      router.back();
    },
    onError: (error: Error) => {
      showError("Error", error.message);
    },
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: (deliveryId: string) => riderAcceptBooking(deliveryId),
    onSuccess: async (_, deliveryId) => {
      Sentry.addBreadcrumb({
        message: 'Delivery accepted successfully',
        category: 'delivery',
        level: 'info',
        data: { orderId: data?.order?.id }
      });

      // Invalidate queries first
      await queryClient.invalidateQueries({
        queryKey: ["order", data?.order?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", data?.delivery?.sender_id],
      });

      // Wait for refetch to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["order", id] }),
        queryClient.refetchQueries({ queryKey: ["user-orders", user?.sub] }),
        queryClient.refetchQueries({ queryKey: ["riders", user?.sub] })
      ]);
      refetch()

      // Start tracking
      await startDeliveryTracking(data?.delivery?.id!, user?.sub!);

      // Then navigate and show success
      showSuccess(
        "Success",
        "This order has been assigned to you. Drive carefully!"
      );
      // router.back();
    },
    onError: (error: Error) => {
      showError("Error", error.message);
      Sentry.captureException(error, {
        extra: {
          orderId: data?.order?.id,
          action: 'accept_delivery'
        },
        tags: {
          feature: 'delivery-management'
        }
      });
    },
  });

  const pickupDeliveryMutation = useMutation({
    mutationFn: (deliveryId: string) => riderPickupDelivery(deliveryId),
    onSuccess: async (_, deliveryId) => {
      Sentry.addBreadcrumb({
        message: 'Delivery pickup confirmed',
        category: 'delivery',
        level: 'info',
        data: { orderId: data?.order?.id }
      });

      // Invalidate queries first
      await queryClient.invalidateQueries({
        queryKey: ["order", data?.order?.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", data?.delivery?.sender_id],
      });

      // Wait for refetch to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["order", id] }),
        queryClient.refetchQueries({ queryKey: ["user-orders", user?.sub] }),
      ]);

      refetch()
      // Start tracking
      await startDeliveryTracking(data?.delivery?.id!, user?.sub!);



      // Then navigate and show warning
      showWarning(
        "Item Pickup",
        "Please ensure the item(s) is/are correct, complete and okay."
      );
      // router.back();
    },
    onError: (error: Error) => {
      showError("Error", error.message);
      Sentry.captureException(error, {
        extra: {
          orderId: data?.order?.id,
          action: 'pickup_delivery'
        },
        tags: {
          feature: 'delivery-management'
        }
      });
    },
  });

  const declineBookingMutation = useMutation({
    mutationFn: (orderId: string) => riderDeclineBooking(orderId),
    onSuccess: async (_, orderId) => {
      Sentry.addBreadcrumb({
        message: 'Booking declined',
        category: 'delivery',
        level: 'info',
        data: { orderId: data?.order?.id }
      });

      // Invalidate queries first
      await queryClient.invalidateQueries({
        queryKey: ["order", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", data?.delivery?.sender_id],
      });
      await queryClient.invalidateQueries({ queryKey: ["riders", user?.sub] })


      // Wait for refetch to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["order", id] }),
        queryClient.refetchQueries({ queryKey: ["user-orders", user?.sub] }),
        queryClient.refetchQueries({ queryKey: ["riders", user?.sub] })

      ]);

      refetch()

      // Then navigate and show warning
      showWarning("Decline", "Booking declined!");
      router.back();
    },
    onError: (error: Error) => {
      showError("Error", error.message);
      Sentry.captureException(error, {
        extra: {
          orderId: data?.order?.id,
          action: 'decline_booking'
        },
        tags: {
          feature: 'delivery-management'
        }
      });
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: (deliveryId: string) => riderMarkDelivered(deliveryId),
    onSuccess: async (_, deliveryId) => {
      Sentry.addBreadcrumb({
        message: 'Delivery marked as delivered',
        category: 'delivery',
        level: 'info',
        data: { orderId: data?.order?.id }
      });

      // Invalidate queries first
      await queryClient.invalidateQueries({
        queryKey: ["order", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", data?.delivery?.sender_id],
      });

      // Wait for refetch to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["order", id] }),
        queryClient.refetchQueries({ queryKey: ["user-orders", user?.sub] }),
      ]);
      refetch()

      // Stop tracking and clear location
      stopDeliveryTracking();
      useLocationStore.getState().clearRiderLocation();

      // Then navigate and show success
      showSuccess("Success", "Item delivered.");
      router.back();
    },
    onError: (error: Error) => {
      showError("Error", error.message);
      Sentry.captureException(error, {
        extra: {
          orderId: data?.order?.id,
          action: 'mark_delivered'
        },
        tags: {
          feature: 'delivery-management'
        }
      });
    },
  });

  const cancelDeliveryMutation = useMutation({
    mutationFn: cancelDelivery,
    onSuccess: async () => {
      Sentry.addBreadcrumb({
        message: 'Delivery cancelled',
        category: 'delivery',
        level: 'info',
        data: { orderId: data?.order.id }
      });

      // Invalidate queries first
      await queryClient.invalidateQueries({
        queryKey: ["order", id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", user?.sub],
      });
      await queryClient.invalidateQueries({
        queryKey: ["user-orders", data?.delivery?.sender_id],
      });

      // Wait for refetch to complete
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ["order", id] }),
        queryClient.refetchQueries({ queryKey: ["user-orders", user?.sub] }),
      ]);

      refetch()

      // Then navigate and show info
      showInfo("Delivery cancelled!");
      router.back();
    },
    onError: (error: Error) => {
      showError("Error", error.message);
      Sentry.captureException(error, {
        extra: {
          orderId: data?.order?.id,
          action: 'cancel_delivery'
        },
        tags: {
          feature: 'delivery-management'
        }
      });
    },
  });




const openAlert = async () => {
  const isValid = await trigger(); // Validate all fields
  if (!isValid) {
    showError("Validation Error", "Please fill in a valid reason (10+ characters).");
    return;
  }

  const formData = getValues(); 
  console.log("Form data before confirmation:", formData);

  Alert.alert(
    "Confirm",
    "If this order is in transit, you'll not be refunded. Are you sure you want to cancel?",
    [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        onPress: () => {
          console.log("Confirmed with data:", formData);
          cancelDeliveryMutation.mutate(formData);
          closeSheet();
        },
      },
    ]
  );
};

const onSubmit = (data: CancelFormData) => {
  console.log("Submitting form data:", data);
  cancelDeliveryMutation.mutate(data);
  closeSheet();
};

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  // WebSocket connection effect
  useEffect(() => {
    // Skip if missing data or unmounted
    if (!data?.delivery?.id || !user?.sub || !isMountedRef.current) return;

    let isSubscribed = true;

    const connectWebSocket = async () => {
      try {
        const token = await authStorage.getToken();
        if (!token || !isSubscribed) return;

        const wsUrl = `wss://api.servi-pal.com/ws?token=${token}&client_type=mobile`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          if (isSubscribed) {
            console.log("✅ WebSocket connected");
          }
        };

        ws.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const message = JSON.parse(event.data);
            console.log("WebSocket Message: ", message)
            if (message.type === "rider_location_update") {
              // Only update it for current delivery
              const deliveryId = String(message.delivery_id);
              const currentDeliveryId = String(data?.delivery?.id);

              if (deliveryId !== currentDeliveryId) {
                console.log("Wrong delivery:", deliveryId, "vs", currentDeliveryId);
                Sentry.captureException('error', {
                  extra: {
                    deliveryId: data?.delivery?.id,
                    action: `Wrong delivery: ${deliveryId} vs ${currentDeliveryId}`
                  },
                  tags: {
                    feature: 'WebSocket-management'
                  }
                });
                return;
              }

              const coords = message.coordinates;
              if (!Array.isArray(coords) || coords.length !== 2) {
                console.log("Invalid coordinates:", coords);
                Sentry.captureException('error', {
                  extra: {
                    deliveryId: data?.delivery?.id,
                    action: `Invalid coordinates: ${coords}`
                  },
                  tags: {
                    feature: 'WebSocket-management'
                  }
                });
                return;
              }

              const [lat, lng] = coords;
              if (isNaN(lat) || isNaN(lng)) return;

              useLocationStore.getState().setRiderLocation(deliveryId, [lat, lng]);
            }
          } catch (e) {
            console.error("WebSocket message error:", e);
            Sentry.captureException(e, {
              extra: {
                deliveryId: data?.delivery?.id,
                action: `Error connecting to WebSocket: ${e}`
              },
              tags: {
                feature: 'WebSocket-management'
              }
            });
          }
        };

        ws.onerror = (error) => {
          if (isSubscribed) {
            console.error("WebSocket error:", error);
          }
        };

        ws.onclose = () => {
          if (isSubscribed) {
            console.log("WebSocket closed");
          }
        };
      } catch (error) {
        if (isSubscribed) {
          console.error("Failed to connect WebSocket:", error);
        }
      }
    };

    connectWebSocket();

    // Cleanup function for this effect
    return () => {
      isSubscribed = false;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [data?.delivery?.id, user?.sub]);


useEffect(() => {
  if (data?.order?.id) {
    setValue("orderId", data.order.id);
  }
}, [data?.order?.id, setValue]);


  useEffect(() => {
    if (!data?.delivery?.id || !data?.delivery?.last_known_rider_coordinates) return;

    const [lat, lng] = data.delivery.last_known_rider_coordinates;
    if (isNaN(lat!) || isNaN(lng!)) return;

    useLocationStore.getState().setRiderLocation(
      data.delivery.id,
      [lat!, lng!]
    );
  }, [data?.delivery?.id, data?.delivery?.last_known_rider_coordinates]);


  const getActionButton = () => {
    if (!data || !data.delivery || !user || !data.order) return null;

    const { delivery, order } = data;
    const isSender = user.sub === delivery.sender_id;
    const isRider = user.sub === delivery.rider_id;
    const isDispatch = delivery.dispatch_id && user.sub === delivery.dispatch_id;

    // 1. Rider: Accept or Decline (pending + assigned)
    if (
      delivery?.delivery_status === "pending" &&
      isRider &&
      !isSender
    ) {
      return [
        {
          label: "Accept",
          onPress: () => acceptDeliveryMutation.mutate(order.id!),
          loading: acceptDeliveryMutation.isPending,
        },
        {
          label: "Decline",
          onPress: () => declineBookingMutation.mutate(order.id!),
          loading: declineBookingMutation.isPending,
          variant: "outline" as const,
        },
      ];
    }

    // 2. Rider: Pickup item (after accepting)
    if (
      delivery?.delivery_status === "accepted" &&
      isRider &&
      !isSender
    ) {
      return {
        label: "Confirm Pickup",
        onPress: () => pickupDeliveryMutation.mutate(order.id!),
        loading: pickupDeliveryMutation.isPending,
      };
    }

    // 3. Rider: Mark as Delivered (after pickup)
    if (
      delivery?.delivery_status === "picked-up" &&
      (isRider || isDispatch)
    ) {
      return {
        label: "Mark as Delivered",
        onPress: () => markDeliveredMutation.mutate(delivery.id!),
        loading: markDeliveredMutation.isPending,
      };
    }

    // 4. Sender: Confirm Received (when rider marks delivered)
    if (
      delivery?.delivery_status === "delivered" &&
      isSender
    ) {
      return {
        label: "Confirm Received",
        onPress: () => confirmReceivedMutation.mutate(),
        loading: confirmReceivedMutation.isPending,
      };
    }

    // 5. Final state: Order completed
    if (delivery?.delivery_status === "received") {
      return {
        label: "Order Completed",
        disabled: true,
      };
    }

    return null;
  };

  const actionButton = getActionButton();
  const showCancel =
    (user?.sub === data?.delivery?.sender_id ||
      user?.sub === data?.delivery?.rider_id) &&
    ["accepted", "pending"].includes(data?.delivery?.delivery_status as string);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const showReview = () => {
    if (data?.order?.order_type === "package") {
      router.push({
        pathname: "/review/[deliveryId]",
        params: {
          deliveryId: data?.order?.id as string,
          revieweeId: data?.delivery?.rider_id as string,
          dispatchId: data?.delivery?.dispatch_id as string,
          orderId: data?.order?.id as string,
          orderType: data?.order?.order_type as string,
          reviewType: "rider",
        },
      });
    } else {
      router.push({
        pathname: "/review/[deliveryId]",
        params: {
          deliveryId: data?.order?.id as string,
          revieweeId: data?.order?.vendor_id as string,
          orderId: data?.order?.id as string,
          orderType: data?.order?.order_type as string,
          reviewType: data?.order?.order_type as string,
        },
      });
    }
  };

  return (
    <>
      {data?.delivery?.id ? (<DeliveryWrapper id={data?.delivery?.id!}  isPickedUp={isPickedUp}>
        {user?.sub === data.delivery.sender_id &&
          data?.delivery?.rider_id &&
          data?.delivery?.delivery_status !== "pending" &&
          data?.delivery?.delivery_status !== "received" && (
            <View className="self-center w-full justify-center items-center">
              <AppVariantButton
                icon={<UserRound color="orange" />}
                width={"50%"}
                borderRadius={50}
                filled={false}
                outline={true}
                label="Contact Rider"
                onPress={viewRiderProfile}

              />
            </View>
          )}

          <View className="flex-row self-center gap-3">
        {user?.sub === data?.delivery?.sender_id
          && (data?.order?.order_payment_status === 'paid' ||data?.order?.order_payment_status==='failed' || data?.order?.order_payment_status==='cancelled') &&
          data?.delivery?.id &&
          !data?.delivery?.rider_id && !data?.delivery?.dispatch_id && (
           
              <AppVariantButton
                icon={<UserRound color="orange" />}
                width={"50%"}
                borderRadius={50}
                filled={false}
                outline={true}
                label={"Assign Rider"}
                onPress={handleRiderReassign}

              />
          
          )}
        {user?.sub === data?.delivery?.sender_id &&
          data?.order.order_payment_status !== "paid" && (
            <AppButton
              title="Pay"
              width={"35%"}
              borderRadius={50}
              icon={<DollarSignIcon color="white" />}
              onPress={() =>
                router.push({
                  pathname: "/payment/[orderId]",
                  params: {
                    orderId: data?.order.id ?? "",
                    deliveryFee: data?.delivery?.delivery_fee,
                    orderNumber: data?.order?.order_number,
                    deliveryType: `${data?.order?.require_delivery === "delivery"
                      ? data?.delivery?.delivery_type
                      : data?.order?.order_type
                      }`,
                    orderItems: JSON.stringify(data?.order.order_items ?? []),
                    paymentLink: data?.order.payment_link,
                    orderType:
                      data?.order?.order_type || data?.delivery?.delivery_type,
                  },
                })
              }
            />
          )}
 </View>
        <View className="my-5 w-[95%] self-center bg-background h-[100%] flex-1 px-5">
          <View className="gap-5">
            <View className="gap-5 items-baseline justify-between flex-row">
              <Text className="text-primary font-semibold text-[12px] mb-5">
                ORDER DETAILS
              </Text>

              {showCancel && (
                <TouchableOpacity

                  onPress={openSheet}
                  className="self-start"
                >
                  <Text className="text-red-500 self-start bg-red-500/30 rounded-full px-5 py-2 font-poppins-semibold text-sm mb-5">
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              <Status status={data?.delivery?.delivery_status} />
            </View>
            <View className="flex-row justify-between">
              <View className="flex-row gap-3">
                <Info color="orange" size={15} />

                <Text className="font-normal text-primary text-sm font-poppins-light">
                  Order ID
                </Text>
              </View>
              <Text className="font-poppins-semibold text-primary text-sm">
                # {data?.order?.order_number}
              </Text>
            </View>
            <View className="gap-3 flex-row  justify-between">
              <View className="flex-row gap-3">
                <Wallet color="orange" size={15} />

                <Text className="font-poppins-light text-primary text-sm">
                  Delivery fee(After commission)
                </Text>
              </View>
              <Text className="font-[500] text-primary text-[12px] font-poppins-semibold">
                ₦ {Number(data?.delivery?.amount_due_dispatch).toFixed(2)}
              </Text>
            </View>
            {(user?.sub === data?.delivery?.sender_id ||
              user?.sub === data?.delivery?.rider_id ||
              user?.sub === data?.delivery?.dispatch_id) && (
                <View className="flex-row justify-between">
                  <View className="flex-row gap-3">
                    <Phone color="orange" size={15} />

                    <Text className="font-poppins-light text-primary text-sm">
                      Sender Phone
                    </Text>
                  </View>
                  <Text className="font-[500] text-primary text-[12px] font-poppins-semibold">
                    {data?.delivery?.sender_phone_number}
                  </Text>
                </View>
              )}

            <View>
              <View className="flex-row gap-3">
                <MapPin color="orange" size={15} />

                <Text className="font-poppins-light text-primary text-sm">
                  Delivery Address
                </Text>
              </View>
              <Text className=" mx-7 text-primary text-sm font-poppins-light">
                {data?.delivery?.destination}
              </Text>
            </View>
          
              <View className="flex-row gap-3">
            <TriangleAlert color="orange" size={15} />
            <Text className="font-poppins-light text-wrap text-xs text-yellow-500">Before leaving, both the sender and rider should confirm the item’s content and condition together.</Text>
          </View>
            <Text onPress={() => setModalVisible(true)} className=" underline mx-7 text-blue-400 text-sm font-poppins-light">
              View Image
            </Text>
          </View>
          <View className="justify-center w-full items-center gap-3 self-center mt-4">
            {actionButton && (
              <>
                {Array.isArray(actionButton) ? (
                  // Accept + Decline buttons
                  <View className="flex-row gap-3 w-full px-5">
                    {actionButton.map((btn, index) => (
                      <AppVariantButton
                        key={index}
                        borderRadius={50}
                        label={btn.label}
                        backgroundColor={index === 0 ? "orange" : "transparent"}
                        filled={index===0?true:false}
                        outline={index === 1}
                        icon={btn.loading && <ActivityIndicator color={index === 0 ? "#fff" : "orange"} />}
                        width={"48%"}
                        onPress={btn.onPress}
                        disabled={btn.loading}
                        color={'red'}
                      />
                    ))}
                  </View>
                ) : (
                  // Single action button
                  <AppVariantButton
                    borderRadius={50}
                    label={actionButton.label}
                    backgroundColor={
                      actionButton.disabled || data?.delivery?.delivery_status === "received"
                        ? "rgba(0,0,0,0.3)"
                        : "orange"
                    }

                    icon={actionButton.loading && <ActivityIndicator color="#fff" />}
                    width={"90%"}
                    onPress={actionButton.onPress}
                    disabled={actionButton.disabled || actionButton.loading}
                  />
                )}
              </>
            )}
          </View>


          {/* Additional Action Buttons */}
          <View className="flex-row w-[90%] self-center justify-between mt-4 mb-8 gap-2">
            {/* Review Button - Hide for package deliveries */}
            {(data?.order?.order_status === "received" ||
              data?.delivery?.delivery_status === "delivered" ||
              data?.delivery?.delivery_status === "received" && (data?.delivery?.rider_id !== user?.sub || data?.delivery?.dispatch_id !== user?.sub)) && (
                <AppVariantButton
                  label="Review"
                  filled={false}
                  outline={true}
                  borderRadius={50}
                  width="32%"
                  onPress={showReview}
                />
              )}

            {/* Report Button - Show for all delivery types */}
            {(data?.order?.order_status === "received" ||
              data?.delivery?.delivery_status === "delivered" ||
              data?.delivery?.delivery_status === "received") && (
                <AppVariantButton
                  label="Report"
                  filled={false}
                  outline={true}
                  borderRadius={50}
                  width="32%"
                  onPress={() => {
                    router.push({
                      pathname: "/report/[deliveryId]",
                      params: { deliveryId: id as string },
                    });
                  }}
                />
              )}

            {
              user?.user_type === 'rider' || user?.user_type === 'dispatch' ?
                ''
                :
                (<AppVariantButton
                  label="Receipt"
                  borderRadius={50}
                  disabled={
                    data?.delivery?.rider_id === user?.sub ||
                      data?.delivery?.dispatch_id === user?.sub
                      ? true
                      : false
                  }
                  filled={false}
                  outline={true}
                  width={"32%"}
                  onPress={() => {
                    router.push({
                      pathname: "/receipt/[deliveryId]",
                      params: { deliveryId: id as string },
                    });
                  }}
                />)
            }
          </View>
        </View>

      </DeliveryWrapper>) : (
        <View className="flex-1 justify-center items-center p-5">
          <Text className="text-red-500">Order not found</Text>
        </View>
      )}
   
            <BottomSheet
                index={-1}
                snapPoints={['50%']}
                ref={bottomSheetRef}
                enablePanDownToClose={true}
                enableDynamicSizing={true}
                handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }}
                handleStyle={{ backgroundColor: HANDLE_STYLE }}
                backgroundStyle={{
                    borderTopLeftRadius: 40,
                    borderTopRightRadius: 40,
                    backgroundColor: BG_COLOR,
                    shadowColor: 'orange',
                    shadowOffset: {
                        width: 0,
                        height: -4
                    },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                    elevation: 20
                }}
            >
        <BottomSheetView style={{ backgroundColor: BG_COLOR, padding: 16, flex: 1 }}>

          <View className="hidden">
            <Controller
              control={control}
              name="orderId"
              render={({ field: { onChange, value } }) => (
                <AppTextInput
                  value={data?.order?.id || value}
                  onChange={onChange}
                />

              )}
            />
          </View>
          <View className="mb-5">
             <Controller
              control={control}
              name="cancelReason"
              render={({ field: { onChange, value, onBlur } }) => (

                <View className="w-[90%] self-center">

                 <TextInput
                                        placeholder="Please describe the issue in detail..."
                                        value={value}
                                        onChangeText={onChange}
                                        numberOfLines={4}
                                        multiline={true}
                                        style={{
                                            backgroundColor: COLOR,
                                            borderRadius: 8,
                                            color: TEXT,
                                            alignSelf: 'center',
                                            width: '100%',

                                        }}
                                    />
                                     <Text className="font-poppins-light text-red-400 text-xs">{errors.cancelReason?.message}</Text>
          </View>
             
              )}
            />

          
          </View>
        

          <AppVariantButton
            label="Cancel Booking"
            width={"90%"}
            onPress={openAlert}
          />
        </BottomSheetView>
      </BottomSheet>
      <RiderProfile ref={riderProfileRef} riderId={data?.delivery?.rider_id} showButton={false} />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
          style={StyleSheet.absoluteFillObject}
          className="bg-black/90 items-center justify-center"
        >
          <View
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
            style={{ height: IMAGE_HEIGHT, width: '100%' }}
            className="self-center"
          >
            <Image
              src={data?.order?.order_items[0]?.images[0].url}
              style={{ width: '100%', height: IMAGE_HEIGHT, resizeMode: 'cover' }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
const IMAGE_HEIGHT = Dimensions.get('window').height * 0.4;
export default ItemDetails;


