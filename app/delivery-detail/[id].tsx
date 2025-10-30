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

const cancelSchema = z.object({
  orderId: z.string(),
  cancelReason: z.string().min(10, "Reason must be at least 10 characters").max(500, "Reason must be less than 500 characters"),
});

type CancelFormData = z.infer<typeof cancelSchema>;

const ItemDetails = () => {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme();
  const { user } = useUserStore();
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
      await startDeliveryTracking(deliveryId, user?.sub!);

      showSuccess(
        "Success",
        "This order has been assigned to you. Drive carefully!"
      );
    },
    onError: (error: Error) => {
      showError("Error", error.message);
    },
  });
  const pickupDeliveryMutation = useMutation({
    mutationFn: (deliveryId: string) => riderPickupDelivery(deliveryId),
    onSuccess: async (_, deliveryId) => {
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
      await startDeliveryTracking(deliveryId, user?.sub!);

      showWarning(
        "Item Pickup",
        "Please confirm the item is correct, complete and ok before living.",
        5
      );
    },
    onError: (error: Error) => {
      showError("Error", error.message);
    },
  });

  const declineBookingMutation = useMutation({
    mutationFn: (deliveryId: string) => riderDeclineBooking(deliveryId),
    onSuccess: async (_, deliveryId) => {
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
      await startDeliveryTracking(deliveryId, user?.sub!);

      showWarning("Decline", "Booking declined!");
    },
    onError: (error: Error) => {
      showError("Error", error.message);
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: (deliveryId: string) => riderMarkDelivered(deliveryId),
    onSuccess: (_, deliveryId) => {
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
    },
  });

  const cancelDeliveryMutation = useMutation({
    mutationFn: cancelDelivery,
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
      router.push("/(app)/delivery/(topTabs)/orders");

      showInfo("Delivery cancelled!");
    },
    onError: (error: Error) => {
      showError("Error", error.message);
    },
  });


  const onSubmit = (data: CancelFormData) => {

    Alert.alert("Confirm", `If this order is in transit, you'll not be refunded. Are you sure you want to cancel?`, [
      {
        text: "Cancel",
        style: "destructive",
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
    if (!id || !user?.sub || !isMountedRef.current) return;

    let isSubscribed = true; // local guard for this effect

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
            if (message.type === "rider_location_update") {
              // Only update if for current delivery
              if (message.delivery_id === id) {
                const coords: [number, number] = [
                  message.coordinates.latitude,
                  message.coordinates.longitude,
                ];
                useLocationStore
                  .getState()
                  .setRiderLocation(id as string, coords);
              }
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
  }, [id, user?.sub]);

  const getActionButton = () => {
    if (!data || !user) return null;

    // Rider accept booking
    if (
      data?.delivery?.delivery_status === "pending" &&
      data?.delivery?.rider_id === user?.sub &&
      user?.sub !== data?.delivery?.sender_id
    ) {
      return {
        label: "Accept",
        onPress: () => {
          acceptDeliveryMutation.mutate(data.order.id!);
        },
        loading: acceptDeliveryMutation.isPending,
      };
    }
    // Rider decline booking
    if (
      data?.delivery?.delivery_status === "pending" &&
      data?.delivery?.rider_id === user?.sub &&
      user?.sub !== data?.delivery?.sender_id
    ) {
      return {
        label: "Decline",
        onPress: () => {
          declineBookingMutation.mutate(data.order.id!);
        },
        loading: declineBookingMutation.isPending,
      };
    }
    // Rider pickup item from sender
    if (
      data?.delivery?.delivery_status === "accepted" &&
      data?.delivery?.rider_id === user?.sub &&
      user?.sub !== data?.delivery?.sender_id
    ) {
      return {
        label: "Pickup",
        onPress: () => {
          pickupDeliveryMutation.mutate(data.order.id!);
        },
        loading: pickupDeliveryMutation.isPending,
      };
    }

    // Sender can confirm received if delivered
    if (
      data?.delivery?.delivery_status === "delivered" &&
      user?.sub === data?.delivery?.sender_id
    ) {
      return {
        label: "Confirm Received",
        onPress: () => confirmReceivedMutation.mutate(),
        loading: confirmReceivedMutation.isPending,
      };
    }
    // Rider mark order delivered
    if (
      (data?.delivery?.delivery_status === "pickup" &&
        user?.sub === data?.delivery?.rider_id) ||
      data?.delivery?.dispatch_id
    ) {
      return {
        label: "Delivered",
        onPress: () => markDeliveredMutation.mutate(data.order.id!),
        loading: markDeliveredMutation.isPending,
      };
    }

    if (data?.delivery?.delivery_status === "received") {
      return {
        label: "Received",
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
      <DeliveryWrapper id={data?.delivery?.id!}>
        {user?.sub === data?.delivery?.sender_id &&
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
          </View>
          <View className="justify-center w-full items-center gap-3 self-center mt-4">
            {actionButton && (
              <AppVariantButton
                borderRadius={50}
                label={
                  data?.delivery?.delivery_status === "received" ||
                    data?.order?.order_status === "received"
                    ? "Order Completed"
                    : actionButton.label
                }
                backgroundColor={
                  data?.delivery?.delivery_status === "received"
                    ? "rgba(0,0,0, 0.5)"
                    : "orange"
                }
                icon={
                  actionButton.loading && <ActivityIndicator color="#eee" />
                }
                width={"90%"}
                onPress={actionButton.onPress}
                disabled={
                  (data?.delivery?.sender_id === user?.sub &&
                    data?.delivery?.delivery_status !== "delivered") ||
                  (data?.delivery?.rider_id === user?.sub &&
                    data?.delivery?.delivery_status === "delivered") ||
                  data?.delivery?.delivery_status === "received" ||
                  actionButton?.loading
                }
              />
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
      </DeliveryWrapper>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["50%"]}
        index={-1}
        enablePanDownToClose={true}
        handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }}
        style={{ flex: 1 }}
        handleStyle={{ backgroundColor: HANDLE_STYLE }}
      >
        <BottomSheetView>

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

const styles = StyleSheet.create({});
