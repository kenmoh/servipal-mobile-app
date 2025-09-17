import { fetchOrder, senderConfirmDeliveryReceived, updateOrderStatus } from "@/api/order";
import AppVariantButton from "@/components/core/AppVariantButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useToast } from "@/components/ToastProvider";
import { useAuth } from "@/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import { CreditCard, Share2 } from "lucide-react-native";
import React from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    Text,
    useColorScheme,
    View,
} from "react-native";


const OrderReceiptPage = () => {
    const { orderId, paymentStatus } = useLocalSearchParams();
    const screenWidth = Dimensions.get("window").width;
    const theme = useColorScheme();
    const { user } = useAuth()
    const { showError, showSuccess } = useToast()
    const queryClient = useQueryClient()
    const ICON_COLOR = theme === 'dark' ? 'white' : 'black'
    const { data, isLoading } = useQuery({
        queryKey: ["order", orderId],
        queryFn: () => fetchOrder(orderId as string),
    });


    const handleGotoPayment = () => {
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
                orderType: data?.order?.order_type || data?.delivery?.delivery_type,
            },
        })
    }

    const generateReceiptHTML = () => {
        if (!data) return "";

        // Function to truncate long text
        const truncateText = (text: string, maxLength: number = 150) => {
            if (!text) return "";
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + "...";
        };

        return `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
                        
                        body { 
                            font-family: 'Poppins', sans-serif;
                            padding: 20px;
                            color: #333;
                            background-color: #fff;
                            margin: 0;
                            line-height: 1.6;
                            height: 100vh;
                            overflow-y: auto;
                        }
                        
                        .container {
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            min-height: 100%;
                        }
                        
                        .header { 
                            text-align: center; 
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 2px solid #f0f0f0;
                        }

                        .logo {
                            width: 80px;
                            height: 80px;
                            margin: 0 auto 12px;
                            display: block;
                        }
                        
                        .header h1 {
                            color: #333;
                            margin: 0;
                            font-size: 24px;
                            font-weight: 600;
                        }
                        
                        .section { 
                            margin-bottom: 25px;
                            padding: 20px;
                            background-color: #f8f9fa;
                            border-radius: 12px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                        }
                        
                        .section h2 {
                            color: #444;
                            margin: 0 0 15px 0;
                            font-size: 18px;
                            font-weight: 500;
                        }
                        
                        .row { 
                            display: flex; 
                            justify-content: space-between; 
                            margin-bottom: 12px;
                            padding: 8px 0;
                            gap: 5px;
                            border-bottom: 1px solid #eee;
                        }
                        
                        .row:last-child {
                            border-bottom: none;
                        }
                        
                        .row span:first-child {
                            color: #666;
                            font-weight: 400;
                        }
                        
                        .row span:last-child {
                            font-weight: 500;
                        }
                        
                        .total { 
                            font-weight: 600;
                            font-size: 1.1em;
                            color: #000;
                            background-color: #f0f0f0;
                            padding: 10px;
                            border-radius: 6px;
                            margin-top: 10px;
                        }
                        
                        .status-paid {
                            color: #28a745;
                            font-weight: 600;
                        }
                        
                        .status-unpaid {
                            color: #dc3545;
                            font-weight: 600;
                        }
                        
                        .amount {
                            font-family: 'Poppins', monospace;
                            font-weight: 600;
                        }

                        .address-info {
                            display: flex;
                            flex-direction: column;
                            gap: 4px;
                            margin-bottom: 12px;
                        }

                        .address-label {
                            font-weight: 600;
                            color: #666;
                            font-size: 13px;
                        }

                        .address-value {
                            color: #4a4a4a;
                            font-size: 13px;
                            line-height: 1.4;
                            word-wrap: break-word;
                            overflow-wrap: break-word;
                            max-width: 100%;
                            padding: 8px;
                            background-color: #fff;
                            border-radius: 6px;
                            border: 1px solid #eee;
                        }
                        
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            padding-top: 20px;
                            border-top: 2px solid #f0f0f0;
                            color: #666;
                            font-size: 12px;
                        }
                        
                        @media print {
                            body {
                                padding: 0;
                            }
                            .section {
                                break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            // <img src="android-icon.png" class="logo" alt="ServiPal Logo" />
                            <h1>Receipt</h1>
                        </div>
                        
                        <div class="section">
                            <div class="row">
                                <span>Order Number</span>
                                <span>#${data.order?.order_number}</span>
                            </div>
                            <div class="row">
                                <span>Date</span>
                                <span>${data.order?.created_at
                ? format(new Date(data.order.created_at), "PPP")
                : "N/A"
            }</span>
                            </div>
                            ${data?.order.order_items.length > 0
                ? `
                                <div class="row">
                                    <span>Items Total</span>
                                    <span class="amount">₦${Number(
                    data.order?.total_price ||
                    0 -
                    Number(
                        data.delivery?.delivery_fee || 0
                    )
                ).toFixed(2)}</span>
                                </div>
                            `
                : ""
            }
                          
                            <div class="row total">
                                <span>Total Amount</span>
                                <span class="amount">₦${Number(
                data.order?.total_price
            ).toFixed(2)}</span>
                            </div>
                            <div class="row">
                                <span>Payment Status</span>
                                <span class="status-${data.order?.order_payment_status === "paid"
                ? "paid"
                : "unpaid"
            }">
                                    ${data.order?.order_payment_status?.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        ${data.order?.order_items &&
                data.order.order_items.length > 0
                ? `
                            <div class="section">
                                <h2>Order Items</h2>
                                ${data.order.order_items
                    .map(
                        (item: any) => `
                                    <div class="row">
                                        <span>${item.quantity}X  ${item.name
                            }</span>
                                        <span class="amount">₦${Number(
                                item.price * item.quantity
                            ).toFixed(2)}</span>
                                    </div>
                                `
                    )
                    .join("")}
                            </div>
                        `
                : ""
            }

                        <div class="section">
                            <h2>Delivery Details</h2>
                            <div class="address-info">
                                <div class="text-primary font-poppins">Delivery Type</div>
                                <div class="address-value">${truncateText(
                data.order?.require_delivery || ""
            )}</div>
                            </div>
                           
                            <div class="row" style="margin-top: 12px;">
                                <span>Status</span>
                                <span>${data.order?.order_status?.toUpperCase()}</span>
                            </div>
                        </div>
                        
                        <div class="footer">
                            <p>Thank you for using ServiPal</p>
                            <p>This is a computer-generated receipt and does not require a signature.</p>
                        </div>
                    </div>
                </body>
            </html>
        `;
    };

    const vendorDeliveryMutation = useMutation({
        mutationFn: () => updateOrderStatus(data?.order?.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["order", orderId],
            });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({
                queryKey: ["orders", data?.order?.vendor_id],
            });
            queryClient.invalidateQueries({
                queryKey: ["orders", data?.order?.owner_id],
            });

            showSuccess("Success", "Order marked as delivered.")

            router.back()
        },
        onError: (error: Error) => {
            showError("Error", error.message)
        },
    });
    const customerreceivedMutation = useMutation({
        mutationFn: () => senderConfirmDeliveryReceived(data?.order?.id as string),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["order", orderId],
            });
            queryClient.invalidateQueries({
                queryKey: ["orders", data?.order?.vendor_id],
            });
            queryClient.invalidateQueries({
                queryKey: ["orders", data?.order?.owner_id],
            });

            showSuccess("Success", "Pickup confirmed successfully!")
        },
        onError: (error: Error) => {
            showError("Error", error.message)
        },
    });

    const handleDownload = async () => {
        try {
            const html = generateReceiptHTML();

            // Generate the PDF
            const { uri } = await Print.printToFileAsync({
                html,
                width: screenWidth,
                height: screenWidth * 1.4,
                base64: false,
            });

            const fileName = `Receipt_${data?.order?.order_number || "unknown"}.pdf`;

            // For iOS and Android sharing
            if (await Sharing.isAvailableAsync()) {

                await Sharing.shareAsync(uri, {
                    UTI: '.pdf',
                    mimeType: 'application/pdf',
                    dialogTitle: 'Share Receipt'
                });

                showSuccess("Success", "Receipt ready to share or save");
            } else {
                // Fallback: Copy to document directory
                const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
                await FileSystem.copyAsync({
                    from: uri,
                    to: destinationUri,
                });

                showSuccess("Success", `Receipt saved to ${destinationUri}`);
            }

        } catch (error) {
            console.error('PDF Download Error:', error);
            showError("Error", "Failed to download receipt");
        }
    };


    // const handleDownloadWithOptions = async () => {
    //   try {
    //     const html = generateReceiptHTML();

    //     const { uri } = await Print.printToFileAsync({
    //       html,
    //       width: screenWidth,
    //       height: screenWidth * 1.4,
    //       base64: false,
    //     });

    //     const fileName = `Receipt_${data?.order?.order_number || "unknown"}.pdf`;

    //     // Show options to user
    //     Alert.alert(
    //       "Download Receipt",
    //       "Choose how you'd like to save your receipt:",
    //       [
    //         {
    //           text: "Share",
    //           onPress: async () => {
    //             if (await Sharing.isAvailableAsync()) {
    //               await Sharing.shareAsync(uri, {
    //                 UTI: '.pdf',
    //                 mimeType: 'application/pdf',
    //                 dialogTitle: 'Share Receipt'
    //               });
    //             }
    //           }
    //         },
    //         {
    //           text: "Save to Photos", 
    //           onPress: async () => {
    //             try {
    //               // Request permissions first
    //               const { status } = await MediaLibrary.requestPermissionsAsync();
    //               if (status === 'granted') {
    //                 await MediaLibrary.saveToLibraryAsync(uri);
    //                 showSuccess("Success", "Receipt saved to Photos");
    //               } else {
    //                 showError("Permission Denied", "Cannot save to Photos without permission");
    //               }
    //             } catch (error) {
    //               showError("Error", "Failed to save to Photos");
    //             }
    //           }
    //         },
    //         {
    //           text: "Open PDF",
    //           onPress: async () => {
    //             if (await Sharing.isAvailableAsync()) {
    //               await Sharing.shareAsync(uri, {
    //                 UTI: '.pdf',
    //                 mimeType: 'application/pdf'
    //               });
    //             }
    //           }
    //         },
    //         {
    //           text: "Cancel",
    //           style: "cancel"
    //         }
    //       ]
    //     );

    //   } catch (error) {
    //     console.error('PDF Download Error:', error);
    //     showError("Error", "Failed to generate receipt");
    //   }
    // };

    const handleShare = async () => {
        try {
            const html = generateReceiptHTML();
            const { uri } = await Print.printToFileAsync({
                html,
                width: screenWidth,
                height: screenWidth * 1.4,
                base64: false,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri, {
                    mimeType: "application/pdf",
                    dialogTitle: `Receipt #${data?.order?.order_number}`,
                    UTI: "com.adobe.pdf",
                });
            } else {
                showError("Error", "Sharing is not available on this device")
            }
        } catch (error) {

            showError("Error", "Failed to share receipt")
        }
    };



    const getActionButton = (): {
        label: string;
        onPress: () => void;
        loading: boolean;
        disabled: boolean;
    } | null => {
        if (!data || !user) return null;

        const status = data.order?.order_status?.toLowerCase();
        const paymentStatus = data.order?.order_payment_status?.toLowerCase();

        if (paymentStatus !== "paid") {
            return null;
        }

        // Vendor can mark order as delivered
        if (data?.order?.order_status === "pending" && user.sub === data.order.vendor_id) {
            return {
                label: "Mark as Delivered",
                onPress: () => vendorDeliveryMutation.mutate(),
                loading: vendorDeliveryMutation.isPending,
                disabled: vendorDeliveryMutation.isPending,
            };
        }

        // Customer can confirm order delivered
        if (data?.order?.order_status === "delivered" && user.sub === data.order.owner_id) {
            return {
                label: "Confirm Delivery",
                onPress: () => customerreceivedMutation.mutate(),
                loading: customerreceivedMutation.isPending,
                disabled: customerreceivedMutation.isPending,
            };
        }

        // For any other paid status before 'received', show a disabled status button
        if (status === "received") {
            return {
                label: status?.replace("_", " ").toUpperCase() || "PROCESSING",
                onPress: () => { },
                loading: false,
                disabled: true,
            };
        }
        return null;
    };

    const actionButton = getActionButton();

    if (isLoading) {
        return <LoadingIndicator />;
    }
    return (
        <ScrollView
            className="flex-1 bg-background content-center"

        >
            <View className="gap-4 px-5 flex-1 overflow-scroll" >
                {/* <Text fontSize={20} fontWeight="bold" textAlign="center">Receipt</Text> */}

                <View className="p-4 bg-background border border-border-subtle rounded-lg" >
                    <View className="gap-3" >
                        <View className="flex-row justify-between">
                            <Text className="font-poppins text-primary">Order Number</Text>
                            <Text className="font-poppins text-primary">#{data?.order?.order_number}</Text>
                        </View>

                        <View className="flex-row justify-between" >
                            <Text className="font-poppins text-primary">Date</Text>
                            <Text className="font-poppins text-primary">
                                {data?.order?.created_at ? format(new Date(data.order.created_at), "PPP") : "N/A"}
                            </Text>
                        </View>

                        <View className="flex-row justify-between" >
                            <Text className="font-poppins text-primary">Total Amount</Text>
                            <Text className="font-poppins text-primary">
                                ₦{Number(data?.order?.total_price).toFixed(2)}
                            </Text>
                        </View>

                        <View className="flex-row justify-between" >
                            <Text className="font-poppins text-primary">Payment Status</Text>
                            <Text
                                className={`${data?.order?.order_payment_status === "paid" ? "text-green-700 bg-green-600/20 " : "text-red-700 bg-red-600/25"} rounded-full px-3 py-1`}

                            >
                                {data?.order?.order_payment_status?.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>

                {data?.order?.order_items && data.order.order_items.length > 0 && (
                    <View className="p-4 bg-input border border-border-subtle rounded-lg">
                        <View className="gap-3" >
                            <Text className="font-poppins-bold text-primary">Order Items</Text>
                            {data.order.order_items.map((item: any) => (
                                <View className="flex-row justify-between " key={item.id} >
                                    <Text className="font-poppins text-primary">
                                        {item.quantity}X {item.name}
                                    </Text>
                                    <Text className="font-poppins text-primary">₦{Number(item.price * item.quantity).toFixed(2)}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <View className="p-4 bg-input border border-border-subtle rounded-lg" >
                    <View className="gap-3">
                        <Text className="font-poppins-bold text-primary">Delivery Details</Text>

                        <View className="flex-row justify-between">
                            <Text className="text-gray-300" >Delivery Type</Text>
                            <Text className="font-poppins text-primary" numberOfLines={2} ellipsizeMode="tail">
                                {data?.order?.require_delivery?.toUpperCase()}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="font-poppins text-primary">Status</Text>
                            <Text className="font-poppins text-primary">{data?.order?.order_status?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {data?.order?.order_status === 'delivered' && user?.sub === data?.order?.user_id && (
                    <AppVariantButton
                        filled={true}
                        borderRadius={50}
                        width="100%"
                        disabled={customerreceivedMutation.isPending}
                        label={'MARK AS RECEIVED'}
                        onPress={customerreceivedMutation.mutate}
                        icon={customerreceivedMutation.isPending && <ActivityIndicator size={'small'} className="text-primary" />}
                    />
                )}
                {data?.order?.order_status === 'pending' && user?.sub === data?.order?.vendor_id && (
                    <AppVariantButton
                        filled={true}
                        borderRadius={50}
                        width="100%"
                        disabled={vendorDeliveryMutation.isPending}
                        label={'MARK AS DELIVERED'}
                        onPress={vendorDeliveryMutation.mutate}
                        icon={vendorDeliveryMutation.isPending && <ActivityIndicator size={'small'} className="text-primary" />}
                    />
                )}

                {data?.order?.order_payment_status !== "paid" && user?.sub === data?.order?.user_id && <AppVariantButton

                    filled
                    borderRadius={50}
                    width="100%"
                    label="P A Y"
                    icon={<CreditCard color={'white'} />}
                    onPress={handleGotoPayment}
                />}



            </View>
            <View
                className="mt-4 w-[90%] flex-row justify-between self-center"

            >
                <>
                    <AppVariantButton
                        outline={true}
                        filled={false}
                        borderRadius={50}
                        width={'30%'}
                        label="Share"
                        icon={<Share2 color={ICON_COLOR} />}
                        onPress={handleShare}

                    />


                    <AppVariantButton
                        outline={true}
                        filled={false}
                        borderRadius={50}
                        width={'30%'}
                        label="Review"

                        onPress={() => {
                            router.push({
                                pathname: "/review/[deliveryId]",

                                params: {
                                    deliveryId: data?.order?.id as string,
                                    revieweeId: data?.order?.vendor_id as string,
                                    orderType: data?.order?.order_type,
                                    orderId: data?.order?.id as string,
                                    reviewType: data?.order?.order_type as string,

                                },
                            });
                        }}

                    />

                    <AppVariantButton
                        outline={true}
                        filled={false}
                        borderRadius={50}
                        width={'30%'}
                        label="Report"
                        onPress={() => {
                            router.push({
                                pathname: "/report/[deliveryId]",
                                params: { deliveryId: data?.order?.id as string },
                            });
                        }}

                    />
                </>
            </View>
        </ScrollView>
    );
};

export default OrderReceiptPage;
