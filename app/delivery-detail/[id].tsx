import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  DollarSignIcon,
  Info,
  MapPin,
  Phone,
  UserRound,
  Wallet,
} from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import * as Sentry from '@sentry/react-native';

const cancelSchema = z.object({
  orderId: z.string(),
  cancelReason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must be less than 500 characters"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

const ItemDetails = () => {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme();
  const { user, setisReassign } = useUserStore();
  const { setDeliveryId } = useOrderStore()
  const { showError, showSuccess, showInfo, showWarning } = useToast();
  const isMountedRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const riderProfileRef = useRef<BottomSheet>(null)

  const HANDLE_INDICATOR_STYLE =
    theme === "dark" ? HEADER_BG_LIGHT : HEADER_BG_DARK;
  const HANDLE_STYLE = theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;

  const openSheet = () => bottomSheetRef.current?.snapToIndex(0);
  const closeSheet = () => bottomSheetRef.current?.close();
  const viewRiderProfile = () => riderProfileRef.current?.snapToIndex(0)


  const { data, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id as string),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });


  const handleRiderReassign = () => {
    setisReassign(true)
    setDeliveryId(data?.delivery?.id!)
    router.push('/(app)/delivery/(topTabs)')

  }


  const {
    control,
    handleSubmit,


  } = useForm<CancelFormData>({
    resolver: zodResolver(cancelSchema),
    mode: "onChange",
    defaultValues: {
      cancelReason: "",
      orderId: data?.order?.id
    },
  });


  const queryClient = useQueryClient();

  const confirmReceivedMutation = useMutation({
    mutationFn: () => senderConfirmDeliveryReceived(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      refetch();
      router.push('/(app)/delivery/(topTabs)/orders');
      showSuccess("Success", "Delivery confirmed and received.");
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
        data: { orderId: data.order.id }
    });
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      refetch();
      await startDeliveryTracking(data?.delivery?.id!, user?.sub!);

      showSuccess(
        "Success",
        "This order has been assigned to you. Drive carefully!"
      );
    },
    onError: (error: Error) => {
      showError("Error", error.message);
      Sentry.captureException(error, {
      extra: {
        orderId: data.order.id,
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
        message: 'Delivery accepted successfully',
        category: 'delivery',
        level: 'info',
        data: { orderId: data.order.id }
    });
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      refetch();
      await startDeliveryTracking(data?.delivery?.id!, user?.sub!);

      showWarning(
        "Item Pickup",
        "Please confirm the item is correct, complete and ok before living.",
        5
      );
    },
    onError: (error: Error) => {
      showError("Error", error.message);
        Sentry.captureException(error, {
      extra: {
        orderId: data.order.id,
        action: 'accept_delivery'
      },
      tags: {
        feature: 'delivery-management'
      }
    });
    },
  });

  const declineBookingMutation = useMutation({
    mutationFn: (deliveryId: string) => riderDeclineBooking(deliveryId),
    onSuccess: async (_, deliveryId) => {
        Sentry.addBreadcrumb({
        message: 'Delivery accepted successfully',
        category: 'delivery',
        level: 'info',
        data: { orderId: data.order.id }
    });
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      refetch();
      await startDeliveryTracking(data?.delivery?.id!, user?.sub!);

      showWarning("Decline", "Booking declined!");
    },
    onError: (error: Error) => {
      showError("Error", error.message);
        Sentry.captureException(error, {
      extra: {
        orderId: data.order.id,
        action: 'accept_delivery'
      },
      tags: {
        feature: 'delivery-management'
      }
    });
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: (deliveryId: string) => riderMarkDelivered(deliveryId),
    onSuccess: (_, deliveryId) => {
        Sentry.addBreadcrumb({
        message: 'Delivery accepted successfully',
        category: 'delivery',
        level: 'info',
        data: { orderId: data.order.id }
    });
      // Invalidate all related queries
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["orders", data?.delivery?.sender_id],
        exact: false,
      });

      // Force refetch of all order-related queries
      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      refetch();
      stopDeliveryTracking();
      useLocationStore.getState().clearRiderLocation();
      showSuccess("Success", "Item delivered.");
    },
    onError: (error: Error) => {
      showError("Error", error.message);
        Sentry.captureException(error, {
      extra: {
        orderId: data.order.id,
        action: 'accept_delivery'
      },
      tags: {
        feature: 'delivery-management'
      }
    });
    },
  });

  const cancelDeliveryMutation = useMutation({
    mutationFn: cancelDelivery,
    onSuccess: () => {
        Sentry.addBreadcrumb({
        message: 'Delivery accepted successfully',
        category: 'delivery',
        level: 'info',
        data: { orderId: data.order.id }
    });
      queryClient.invalidateQueries({
        queryKey: ["order", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      refetch();
      router.push("/(app)/delivery/(topTabs)/orders");

      showInfo("Delivery cancelled!");
    },
    onError: (error: Error) => {
      showError("Error", error.message);
        Sentry.captureException(error, {
      extra: {
        orderId: data.order.id,
        action: 'accept_delivery'
      },
      tags: {
        feature: 'delivery-management'
      }
    });
    },
  });


  const onSubmit = (data: CancelFormData) => {

    Alert.alert("Confirm", `If this order is in transit, you'll not be refunded. Are you sure you want to cancel?`, [
      {
        text: "Cancel",
        style: "default",
      },
      {
        text: "Delete",
        onPress: () => {
          cancelDeliveryMutation.mutate(data);
          closeSheet()
        }
      },
    ]);



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
                return;
              }
              // if (message.delivery_id === data?.delivery?.id) {
              //   const coords: [number, number] = [
              //     message.coordinates.latitude,
              //     message.coordinates.longitude,
              //   ];
              //   useLocationStore
              //     .getState()
              //     .setRiderLocation(data?.delivery?.id as string, coords);
              // }

              const coords = message.coordinates; 
              if (!Array.isArray(coords) || coords.length !== 2) {
                console.log("Invalid coordinates:", coords);
                return;
              }

              const [lat, lng] = coords;
              if (isNaN(lat) || isNaN(lng)) return;

              console.log("Updating rider location:", { deliveryId, lat, lng });

              useLocationStore.getState().setRiderLocation(deliveryId, [lat, lng] as Coordinates);
            }
          } catch (e) {
            console.error("WebSocket message error:", e);
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
  if (!data?.delivery?.id || !data?.delivery?.last_known_rider_coordinates) return;

  const [lat, lng] = data.delivery.last_known_rider_coordinates;
  if (isNaN(lat) || isNaN(lng)) return;

  console.log("Initializing rider location from DB:", { lat, lng });

  useLocationStore.getState().setRiderLocation(
    data.delivery.id,
    [lat, lng]
  );
}, [data?.delivery?.id, data?.delivery?.last_known_rider_coordinates]);


console.log('last_known_rider_coordinates: ', data?.delivery)

const getActionButton = () => {
  if (!data || !data.delivery || !user) return null;

  const { delivery } = data;
  const isSender = user.sub === delivery.sender_id;
  const isRider = user.sub === delivery.rider_id;
  const isDispatch = delivery.dispatch_id && user.sub === delivery.dispatch_id;
  

  // const { delivery } = data;
  // const isSender = user.sub === delivery?.sender_id;
  // const isRider = user.sub === delivery?.rider_id;
  // const isDispatch = user.sub === delivery?.dispatch_id;

  // 1. Rider: Accept or Decline (pending + assigned)
  if (
    delivery?.delivery_status === "pending" &&
    isRider &&
    !isSender
  ) {
    return [
      {
        label: "Accept",
        onPress: () => acceptDeliveryMutation.mutate(delivery.id!),
        loading: acceptDeliveryMutation.isPending,
      },
      {
        label: "Decline",
        onPress: () => declineBookingMutation.mutate(delivery.id!),
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
      onPress: () => pickupDeliveryMutation.mutate(delivery.id!),
      loading: pickupDeliveryMutation.isPending,
    };
  }

  // 3. Rider: Mark as Delivered (after pickup)
  if (
    delivery?.delivery_status === "pickup" &&
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
      {data?.delivery?.id ? (<DeliveryWrapper id={data?.delivery?.id!}>
              {user?.sub === data.delivery.sender_id &&
                data?.delivery?.rider_id &&
                data?.delivery?.delivery_status !== "pending" &&
                data?.delivery?.delivery_status !== "received" && (
                  <View className="self-center w-full justify-center items-center">
                    <AppVariantButton
                      icon={<UserRound color="orange" />}
                      width={"85%"}
                      borderRadius={50}
                      filled={false}
                      outline={true}
                      label="Contact Rider"
                      onPress={viewRiderProfile}
      
                    />
                  </View>
                )}
              {user?.sub === data?.delivery?.sender_id
                && data?.order?.order_payment_status === 'paid' &&
                data?.delivery?.id &&
                !data?.delivery?.rider_id && !data?.delivery?.dispatch_id && (
                  <View className="self-center w-full justify-center items-center">
                    <AppVariantButton
                      icon={<UserRound color="orange" />}
                      width={"85%"}
                      borderRadius={50}
                      filled={false}
                      outline={true}
                      label={!data?.delivery?.rider_id ? "Select Rider" : "Assign Rider"}
                      onPress={handleRiderReassign}
      
                    />
                  </View>
                )}
              {user?.sub === data?.delivery?.sender_id &&
                data?.order.order_payment_status !== "paid" && (
                  <AppButton
                    title="MAKE PAYMENT"
                    width={"85%"}
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
                   <Text className=" mx-7 text-primary text-sm font-poppins-light">
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
                  textColor={index === 0 ? "white" : "orange"}
                  outline={index === 1}
                  icon={btn.loading && <ActivityIndicator color={index === 0 ? "#fff" : "orange"} />}
                  width={"48%"}
                  onPress={btn.onPress}
                  disabled={btn.loading}
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
              textColor="white"
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
                    data?.delivery?.delivery_status === "received") && (
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
                    <AppVariantButton
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
                    />
                  }
                </View>
              </View>
            </DeliveryWrapper>) :(
  <View className="flex-1 justify-center items-center p-5">
    <Text className="text-red-500">Order not found</Text>
  </View>
)}
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["50%"]}
        index={-1}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }}
        style={{ flex: 1 }}
        handleStyle={{ backgroundColor: HANDLE_STYLE }}
      >
        <BottomSheetView style={{ flex: 1 }}>

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
          <Controller
            control={control}
            name="cancelReason"
            render={({ field: { onChange, value } }) => (
              <AppTextInput
                value={value}
                onChange={onChange}
                numberOfLines={4}
                multiline={true}
                placeholder="Reason for cancellation"
              />

            )}
          />


          <AppVariantButton
            label="Cancel Booking"
            borderRadius={50}
            onPress={handleSubmit(onSubmit)}
          />
        </BottomSheetView>
      </BottomSheet>
      <RiderProfile ref={riderProfileRef} riderId={data?.delivery?.rider_id} showButton={false} />
    </>
  );
};

export default ItemDetails;


