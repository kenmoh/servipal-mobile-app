import { useAuth } from '@/context/authContext'
import { useLocationStore } from '@/store/locationStore'
import { DeliveryDetail, DeliveryStatus, PaymentStatus } from '@/types/order-types'
import { AntDesign, Feather, MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Landmark, Package, Shirt, Utensils } from 'lucide-react-native'
import React from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native'

type CardProp = {
    data: DeliveryDetail
    isHomeScreen?: boolean
}

type DeliveryIconProps = {
    type: string;
    size?: number;
    theme: any;
}



// Memoize the DeliveryTypeIcon component
const DeliveryTypeIcon = React.memo(({ type, size = 15, theme }: DeliveryIconProps) => {
    switch (type) {
        case 'food':
            return <Utensils size={size} color='gold' />;
        case 'laundry':
            return <Shirt size={size} color="skyblue" />;
        case 'package':
        default:
            return <Package size={size} color="green" />;
    }
});

DeliveryTypeIcon.displayName = 'DeliveryTypeIcon';

// Memoize the Status component
export const Status = React.memo(({ status, label }: { label?: string, status?: DeliveryStatus }) => {
    const getStatusColors = (status?: DeliveryStatus) => {
        switch (status) {
            case 'pending':
                return { bg: 'rgba(255, 193, 7, 0.12)', color: 'gold' };
            case 'accepted':
                return { bg: 'rgba(33, 150, 243, 0.10)', color: '#0D47A1' };
            case 'delivered':
                return { bg: 'rgba(18, 2, 75, 0.49)', color: '#bbb' };
            case 'received':
                return { bg: 'rgba(5, 20, 105, 0.28)', color: 'rgb(44, 64, 179)' };
            case 'laundry_received':
                return { bg: 'rgba(255, 152, 0, 0.10)', color: '#E65100' };
            case 'canceled':
                return { bg: 'rgba(244, 67, 54, 0.10)', color: '#B71C1C' };
            default:
                return { bg: 'rgba(120, 144, 156, 0.10)', color: '#263238' };
        }
    };

    const colors = getStatusColors(status);

    return (
        <View
            style={{ backgroundColor: colors.bg }}
            className="py-[6px] px-[10px] rounded-full"
        >
            <Text
                style={{ color: colors.color }}
                className="font-poppins-medium text-xs capitalize"
            >
                {label || status}
            </Text>
        </View>
    );
});


// Memoize the Status component
export const PaymentStatusColor = React.memo(({ status }: { status?: PaymentStatus }) => {
    const getPaymentStatusColors = (status?: PaymentStatus) => {
        switch (status) {
            case 'pending':
                return { bg: 'rgba(255, 193, 7, 0.12)', color: 'gold' };
            case 'paid':
                return { bg: 'rgba(45, 243, 111, 0.10)', color: '#bbb' };
            case 'cancelled':
                return { bg: 'rgba(244, 67, 54, 0.10)', color: '#B71C1C' };
            case 'failed':
                return { bg: 'rgba(244, 67, 54, 0.10)', color: '#B71C1C' };
            default:
                return { bg: 'rgba(120, 144, 156, 0.10)', color: '#263238' };
        }
    };

    const colors = getPaymentStatusColors(status);

    return (
        <View
            style={{ backgroundColor: colors.bg }}
            className="py-[6px] px-[12px] rounded-full"
        >
            <Text
                style={{ color: colors.color }}
                className="font-poppins-medium text-xs capitalize"
            >
                {status}
            </Text>
        </View>
    );
});



Status.displayName = 'Status';

const ItemCard = React.memo(({ data, isHomeScreen = false }: CardProp) => {
    const theme = useColorScheme();
    const { setOrigin, setDestination } = useLocationStore();
    const { user } = useAuth()



    const handlePress = React.useCallback(() => {
        // Set origin and destination if available
        if (data?.delivery?.origin && data?.delivery?.pickup_coordinates) {
            setOrigin(
                data.delivery.origin,
                data.delivery.pickup_coordinates as [number, number]
            );
        }

        if (data?.delivery?.destination && data?.delivery?.dropoff_coordinates) {
            setDestination(
                data.delivery.destination,
                data.delivery.dropoff_coordinates as [number, number]
            );
        }

        // Navigate to detail screen
        router.push({
            pathname: '/delivery-detail/[id]',
            params: {
                id: data?.order?.id!,
                orderNumber: data?.order.id
            }
        });
    }, [
        data?.delivery?.id,
        data?.order.id,
        data?.delivery?.origin,
        data?.delivery?.destination,
        data?.delivery?.pickup_coordinates,
        data?.delivery?.dropoff_coordinates,
        setOrigin,
        setDestination
    ]);

    const handleGoToReceipt = (orderId: string) => {
        router.push({
            pathname: "/orderReceipt/[orderId]",
            params: { orderId: orderId as string, paymentStatus: data?.order?.order_payment_status }
        })
    }

    // Memoize computed values
    const firstOrderItem = React.useMemo(() => data?.order.order_items[0], [data?.order.order_items]);
    const imageUrl = React.useMemo(() => firstOrderItem?.images[0]?.url, [firstOrderItem?.images]);
    const itemName = React.useMemo(() => firstOrderItem?.name, [firstOrderItem?.name]);

    const canViewOrderDetail = data?.order?.user_id === user?.sub || data?.order?.owner_id === user?.sub || data?.order?.vendor_id === user?.sub || user?.user_type === 'rider' || user?.user_type === 'dispatch'

    return (
        <TouchableOpacity disabled={!canViewOrderDetail} activeOpacity={0.6} onPress={data?.order?.require_delivery === 'delivery' ? handlePress : () => handleGoToReceipt(data?.order?.id)}>
            <View className='p-[10px]' >
                <View className='flex-row flex-1'>
                    {/* Left side container */}
                    <View className='flex-1 gap-[10px] flex-row'>
                        {/* Image container with fixed dimensions */}
                        <View
                            className='overflow-hidden h-[70px] w-[70px] rounded-[10px] flex-shrink-0'

                        >
                            <Image
                                className='w-full h-full object-cover'

                                src={imageUrl}

                                alt={itemName || 'Order item'}


                            />
                        </View>

                        {/* Content container */}
                        <View className='flex-1 gap-[5px]'>
                            <View className='gap-[5px] flex-row items-center'>
                                <DeliveryTypeIcon
                                    type={data?.order?.require_delivery === 'delivery' ? data?.delivery?.delivery_type! : data?.order?.order_type!}
                                    theme={theme}
                                />
                                <Text
                                    className='text-primary font-poppins-medium text-sm flex-1'

                                    numberOfLines={1}

                                >
                                    {itemName}
                                </Text>

                            </View>

                            {data?.order?.require_delivery === 'pickup' &&
                                <View className='flex-row gap-[5px]'>
                                    <Landmark size={15} color='gray' />

                                    <Text
                                        className='flex-1 text-primary font-poppins-medium text-xs'

                                        numberOfLines={2}
                                    >
                                        {data?.order?.business_name}
                                    </Text>
                                </View>

                            }

                            {data?.order?.require_delivery === 'delivery' &&

                                <>
                                    <View className='flex-row gap-[5px] items-start'>
                                        <MaterialCommunityIcons
                                            name="circle"
                                            color='gray'
                                            size={10}
                                            style={styles.iconStyle}
                                        />
                                        <Text
                                            className='flex-1 text-primary font-poppins-medium text-xs'

                                            numberOfLines={2}
                                        >
                                            {data?.delivery ? data?.delivery?.origin : ''}
                                        </Text>
                                    </View>

                                    <View className='flex-row gap-[5px] items-start'>
                                        <Feather
                                            name="map-pin"
                                            color={'gray'}
                                            size={10}
                                            style={styles.iconStyle}
                                        />
                                        <Text
                                            className='flex-1 text-primary font-poppins-medium text-xs'

                                            numberOfLines={2}
                                        >
                                            {data?.delivery ? data?.delivery?.destination : ''}
                                        </Text>
                                    </View>
                                </>

                            }

                            {data?.order?.require_delivery === 'delivery' && <View className='gap-[5px] flex-row items-center flex-wrap'>
                                <View className='flex-row gap-[5px] items-center flex-shrink-0'>
                                    <Feather name="clock" color='gray' size={10} />
                                    <Text className='text-primary font-poppins text-xs'>
                                        {data?.delivery ? data?.delivery?.duration : ''}
                                    </Text>
                                </View>
                                {/* {'DISTANCE HERE IF NEEDED'} */}
                            </View>}
                        </View>
                    </View>

                    {/* Right chevron */}
                    <View className='flex-shrink-0 w-[20px] justify-center'>
                        <Feather name="chevron-right" size={20} color='gray' />
                    </View>
                </View>

                {/* Bottom info */}
                <View className='flex-row justify-between mt-[10px] pl-20 pr-[10px]'

                >
                    <View className='flex-row gap-[5px] items-center ml-3'>
                        <AntDesign name="wallet" color='gray' size={10} />
                        {data?.order?.require_delivery === 'delivery' ? (
                            <Text className='text-primary font-poppins-medium text-sm'>
                                ₦ {Number(data?.delivery?.delivery_fee).toFixed(2)}
                            </Text>
                        ) : (<Text className='text-primary font-poppins-medium text-sm'>
                            ₦ {Number(data?.order?.total_price).toFixed(2)}
                        </Text>)}
                    </View>

                    {!isHomeScreen && <View className='flex-row gap-[5px]'>
                        <Status
                            label={data?.delivery?.delivery_status === 'accepted' ? 'Assigned' : undefined}
                            status={data?.order?.require_delivery === 'delivery' ? data?.delivery?.delivery_status : data?.order?.order_status}
                        />
                        <PaymentStatusColor status={data?.order?.order_payment_status} />
                    </View>}


                </View>
            </View>
        </TouchableOpacity>
    );
});

ItemCard.displayName = 'ItemCard';

// Move styles outside component to prevent recreation
const styles = StyleSheet.create({
    iconStyle: {
        marginTop: 4
    }
});

export default ItemCard;
