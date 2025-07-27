import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

import {
  cancelDelivery,
  fetchDelivery,
  markLaundryReceived,
  riderAcceptDelivery,
  riderMarkDelivered,
  senderConfirmDeliveryReceived,
} from "@/api/order";
import AppButton from "@/components/AppButton";
import AppVariantButton from "@/components/core/AppVariantButton";
import DeliveryWrapper from "@/components/DeliveryWrapper";
import { Status } from "@/components/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  DollarSignIcon,
  Info,
  MapPin,
  Phone,
  User,
  Wallet,
} from "lucide-react-native";
import { Notifier, NotifierComponents } from "react-native-notifier";

const ItemDetails = () => {
  const { id } = useLocalSearchParams();
  const theme = useColorScheme();
  const { user } = useAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["delivery", id],
    queryFn: () => fetchDelivery(id as string),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const queryClient = useQueryClient();

  const confirmReceivedMutation = useMutation({
    mutationFn: () =>
      senderConfirmDeliveryReceived(data?.delivery?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["deliveries"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      refetch();
      router.back();
      router.back();

      Notifier.showNotification({
        title: "Success",
        description: "Delivery confirmed as received!",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    },
    onError: (error: Error) => {
      Notifier.showNotification({
        title: "Error",
        description: `${error.message}`,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });

  const laundryReceivedMutation = useMutation({
    mutationFn: () => markLaundryReceived(data?.delivery?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
        exact: false,
      });

      queryClient.invalidateQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });
      refetch();
      router.back();

      queryClient.refetchQueries({ queryKey: ["deliveries"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      Notifier.showNotification({
        title: "Success",
        description: "Laundry item received.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    },
    onError: (error: Error) => {
      Notifier.showNotification({
        title: "Error",
        description: `${error.message}`,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: () => riderAcceptDelivery(data?.delivery?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["deliveries"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      refetch();
      router.back();

      Notifier.showNotification({
        title: "Success",
        description: "This order has been assigned to you. Drive carefully!",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    },
    onError: (error: Error) => {
      Notifier.showNotification({
        title: "Error",
        description: `${error.message}`,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: () => riderMarkDelivered(data?.delivery?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["deliveries"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      refetch();
      router.back();

      Notifier.showNotification({
        title: "Success",
        description: "Item delivered.",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    },
    onError: (error: Error) => {
      Notifier.showNotification({
        title: "Error",
        description: `${error.message}`,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });

  const cancelDeliveryMutation = useMutation({
    mutationFn: () => cancelDelivery(data?.delivery?.id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["delivery", id],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries"],
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      queryClient.refetchQueries({ queryKey: ["deliveries"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["deliveries", user?.sub],
        exact: false,
      });

      refetch();
      router.back();

      Notifier.showNotification({
        title: "Success",
        description: "Delivery cancelled!",
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "success" },
      });
    },
    onError: (error: Error) => {
      Notifier.showNotification({
        title: "Error",
        description: `${error.message}`,
        Component: NotifierComponents.Alert,
        componentProps: { alertType: "error" },
      });
    },
  });

  const getActionButton = () => {
    if (!data || !user) return null;

    // Rider can accept if order is pending and they are not assigned yet
    if (
      data?.delivery?.delivery_status === "pending" &&
      !data?.delivery?.rider_id &&
      user?.sub !== data?.delivery?.sender_id
    ) {
      return {
        label: "Pickup",
        onPress: () => {
          acceptDeliveryMutation.mutate();
        },
        loading: acceptDeliveryMutation.isPending,
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
      (data?.delivery?.delivery_status === "accepted" &&
        user?.sub === data?.delivery?.rider_id) ||
      data?.delivery?.dispatch_id
    ) {
      return {
        label: "Delivered",
        onPress: () => markDeliveredMutation.mutate(),
        loading: markDeliveredMutation.isPending,
      };
    }
    // Laundry vendour mark received
    if (
      data?.delivery?.delivery_status === "delivered" &&
      data?.delivery?.delivery_type === "laundry" &&
      user?.sub === data?.order?.vendor_id &&
      user?.user_type === "laundry_vendor"
    ) {
      return {
        label: "Item Received",
        onPress: () => laundryReceivedMutation.mutate(),
        loading: laundryReceivedMutation.isPending,
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
  const showFullBtnSize =
    data?.delivery?.delivery_status === "pending" &&
    user?.sub === data?.delivery?.sender_id;
  const showCancel =
    (user?.sub === data?.delivery?.sender_id ||
      user?.sub === data?.delivery?.rider_id) &&
    ["accepted", "pending"].includes(data?.delivery?.delivery_status as string);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <DeliveryWrapper>
        {user?.sub === data?.delivery?.sender_id &&
          data?.delivery?.sender_id &&
          data?.delivery?.delivery_status !== "pending" &&
          data?.delivery?.delivery_status !== "received" && (
            <TouchableOpacity
              className="bg-background my-[10px] border rounded-[8px] border-border-subtle h-[40px] w-[85%] self-center justify-center items-center"
              style={{
                borderWidth: 1,
              }}
              onPressIn={() =>
                router.push({
                  pathname: "/user-details/[userId]",
                  params: {
                    userId: data?.delivery?.rider_id!,
                  },
                })
              }
            >
              <View className="gap-10">
                <User color={"white"} size={20} />
                <Text className="text-primary">CONTACT RIDER</Text>
              </View>
            </TouchableOpacity>
          )}
        {user?.sub === data?.delivery?.sender_id &&
          data?.order.order_payment_status !== "paid" && (
            <AppButton
              title="MAKE PAYMENT"
              width={"85%"}
              icon={<DollarSignIcon className="text-primary" />}
              onPress={() =>
                router.push({
                  pathname: "/payment/[orderId]",
                  params: {
                    orderId: data?.order.id ?? "",
                    deliveryFee: data?.delivery?.delivery_fee,
                    orderNumber: data?.order?.order_number,
                    deliveryType: `${
                      data?.order?.require_delivery === "delivery"
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
                  onPress={() => cancelDeliveryMutation.mutate()}
                  className="self-start"
                >
                  <Text className="text-red-500 self-start bg-red-500/30 rounded-full px-5 py-2 font-semibold text-xs mb-5">
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
              <AppButton
                title={actionButton.label}
                backgroundColor={
                  data?.delivery?.delivery_status === "received"
                    ? "bg-text-input"
                    : "bg-button-primary"
                }
                icon={
                  actionButton.loading && <ActivityIndicator color="#ccc" />
                }
                width={showCancel ? "50%" : "90%"}
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
          <View className="flex-row w-[90%] self-center justify-between mt-4 gap-2">
            {/* Review Button - Hide for package deliveries */}
            {data?.order?.order_type !== "package" &&
              (data?.order?.order_status === "received" ||
                data?.delivery?.delivery_status === "delivered" ||
                data?.delivery?.delivery_status === "received") && (
                <AppVariantButton
                  label="Review"
                  filled={false}
                  outline={true}
                  width="32%"
                  onPress={() => {
                    router.push({
                      pathname: "/review/[deliveryId]",
                      params: { deliveryId: data?.order?.id },
                    });
                  }}
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
                width="32%"
                onPress={() => {
                  router.push({
                    pathname: "/report/[deliveryId]",
                    params: { deliveryId: id as string },
                  });
                }}
              />
            )}

            {data?.order?.order_payment_status === "paid" &&
              (data?.order?.owner_id === user?.sub ||
                data?.order?.user_id === user?.sub ||
                data?.order?.vendor_id === user?.sub) && (
                <AppVariantButton
                  label="Receipt"
                  filled={false}
                  outline={true}
                  width={
                    data?.delivery?.delivery_status === "received"
                      ? "32%"
                      : "100%"
                  }
                  onPress={() => {
                    router.push({
                      pathname: "/receipt/[deliveryId]",
                      params: { deliveryId: id as string },
                    });
                  }}
                />
              )}
          </View>
        </View>
      </DeliveryWrapper>
    </>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({});
