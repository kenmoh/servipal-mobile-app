import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import {
  fetchOrder,
  markLaundryReceived,
  relistDelivery,
  riderAcceptDelivery,
  riderMarkDelivered,
  senderConfirmDeliveryReceived
} from "@/api/order";
import AppButton from "@/components/AppButton";
import AppVariantButton from "@/components/core/AppVariantButton";
import DeliveryWrapper from "@/components/DeliveryWrapper";
import { Status } from "@/components/ItemCard";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import {
  DollarSignIcon,
  Info,
  MapPin,
  Phone,
  Wallet
} from "lucide-react-native";
import { User } from "stream-chat-expo";

const ItemDetails = () => {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const { showError, showSuccess, showInfo } = useToast()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrder(id as string),
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const queryClient = useQueryClient();

  const confirmReceivedMutation = useMutation({
    mutationFn: () =>
      senderConfirmDeliveryReceived(data?.order?.id as string),
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

      showSuccess("Success", "Delivery confirmed and received.")

    },
    onError: (error: Error) => {
      showError('Error', error.message)

    },
  });

  const laundryReceivedMutation = useMutation({
    mutationFn: () => markLaundryReceived(data?.delivery?.id as string),
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
      refetch();
      router.push('/(app)/delivery/(topTabs)/orders');

      queryClient.refetchQueries({ queryKey: ["orders"], exact: false });
      queryClient.refetchQueries({
        queryKey: ["orders", user?.sub],
        exact: false,
      });

      showSuccess('Success', "Laundry item received.")
    },
    onError: (error: Error) => {
      showError("Error", error.message)

    },
  });

  const acceptDeliveryMutation = useMutation({
    mutationFn: () => riderAcceptDelivery(data?.order?.id as string),
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

      showSuccess("Success", "This order has been assigned to you. Drive carefully!")

    },
    onError: (error: Error) => {
      showError("Error", error.message)
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: () => riderMarkDelivered(data?.delivery?.id as string),
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
      showSuccess("Success", "Item delivered.")
    },
    onError: (error: Error) => {
      showError("Error", error.message)

    },
  });

  const cancelDeliveryMutation = useMutation({
    mutationFn: () => relistDelivery(data?.delivery?.id as string),
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

      showSuccess("Success", "Delivery cancelled!")
    },
    onError: (error: Error) => {
      showError("Error", error.message)

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
  const showCancel =
    (user?.sub === data?.delivery?.sender_id ||
      user?.sub === data?.delivery?.rider_id) &&
    ["accepted", "pending"].includes(data?.delivery?.delivery_status as string);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const showReview = () => {
    if (data?.order?.order_type === 'package') {
      showError('Not Allowed', 'Review for package delivery not allowed!');
      return;
    } else {
      router.push({
        pathname: "/review/[deliveryId]",
        params: { deliveryId: data?.order?.id as string },
      });
    }
  }

  return (
    <>
      <DeliveryWrapper>
        {user?.sub === data?.delivery?.sender_id &&
          data?.delivery?.rider_id &&
          data?.delivery?.delivery_status !== "pending" &&
          data?.delivery?.delivery_status !== "received" && (

            <View className="self-center w-full justify-center items-center">
              <AppVariantButton icon={<User color={'orange'} />} width={"85%"} borderRadius={50} filled={false} outline={true} label="Contact Ridery" onPress={() =>
                router.push({
                  pathname: "/user-details/[userId]",
                  params: {
                    userId: data?.delivery?.rider_id!,
                  },
                })
              } />
            </View>

          )}
        {user?.sub === data?.delivery?.sender_id &&
          data?.order.order_payment_status !== "paid" && (
            <AppButton
              title="MAKE PAYMENT"
              width={"85%"}
              icon={<DollarSignIcon className="text-white" />}
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
                  // onPress={() => cancelDeliveryMutation.mutate()}
                  onPress={() => router.push({
                    pathname: '/cancel-order/[orderId]',
                    params: { orderId: data?.order?.id as string }
                  })}
                  className="self-start"
                >
                  <Text className="text-red-500 self-start bg-red-500/30 rounded-full px-5 py-2 font-poppins-semibold text-sm mb-5">
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}
             {/* {data?.delivery?.delivery_status === "canceled" && (
                <TouchableOpacity
                  // onPress={() => cancelDeliveryMutation.mutate()}
                  onPress={() => router.push({
                    pathname: '/cancel-order/[orderId]',
                    params: { orderId: data?.order?.id as string }
                  })}
                  className="self-start"
                >
                  <Text className="text-teal-500 self-start bg-teal-500/30 rounded-full px-5 py-2 font-poppins-semibold text-sm mb-5">
                    Relist
                  </Text>
                </TouchableOpacity>
              )}*/}
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
                label={data?.delivery?.delivery_status === 'received' || data?.order?.order_status === 'received' ? 'Order Completed' : actionButton.label}
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
            {
              (data?.order?.order_status === "received" ||
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
                disabled={data?.delivery?.rider_id === user?.sub || data?.delivery?.dispatch_id === user?.sub ? true : false}
                filled={false}
                outline={true}
                width={'32%'}
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
    </>
  );
};

export default ItemDetails;

const styles = StyleSheet.create({});
