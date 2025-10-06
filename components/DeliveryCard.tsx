import { useLocationStore } from '@/store/locationStore';
import { useUserStore } from '@/store/userStore';
import { DeliveryDetail } from '@/types/order-types';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Package2, Shirt, Utensils } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import HDivider from './HDivider';

interface DeliveryCardProps {
  orderId: string;
  orderType: 'package' | 'food' | 'laundry';
  origin: string;
  destination: string;
  duration: string;
}

type DeliveryIconProps = {
  type: string;
  size?: number;

}


type CardProp = {
  data: DeliveryDetail

}


export default function DeliveryCard({ data }: CardProp) {



  const { user } = useUserStore();
  const { setOrigin, setDestination } = useLocationStore();



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



  const DeliveryTypeIcon = React.memo(({ type, size = 25 }: DeliveryIconProps) => {
    switch (type) {
      case 'food':
        return <Utensils size={size} color='silver' />;
      case 'laundry':
        return <Shirt size={size} color="skyblue" />;
      case 'package':
      default:
        return <Package2 size={size} color="orange" />;
    }
  });

  const canViewOrderDetail = data?.order?.user_id === user?.sub || data?.order?.owner_id === user?.sub || data?.order?.vendor_id === user?.sub || user?.user_type === 'rider' || user?.user_type === 'dispatch'


  return (
    <TouchableOpacity
      disabled={!canViewOrderDetail} activeOpacity={0.6} onPress={handlePress}
      className="bg-input rounded-2xl p-4 mb-4 shadow-sm w-[95%] self-center my-2">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">

          <DeliveryTypeIcon type={data?.order?.order_type} size={30} />
        </View>
        <View className='flex-row gap-[5px] items-center ml-3'>

          {data?.order?.require_delivery === 'delivery' ? (
            <Text className='text-primary font-poppins-medium text-sm'>
              ₦ {Number(data?.delivery?.delivery_fee).toFixed(2)}
            </Text>
          ) : (<Text className='text-primary font-poppins-medium text-sm'>
            ₦ {Number(data?.order?.total_price).toFixed(2)}
          </Text>)}
        </View>
        <Text className="font-poppins-medium text-primary">ORDER #: {data?.order?.order_number}</Text>

      </View>

      <HDivider />

      <View className="my-4">
        <View className='flex-row items-center mb-2 gap-2'>
          <MaterialCommunityIcons
            name="circle"
            color='gray'
            size={12}

          />


          <Text
            className='flex-1 text-muted font-poppins-light text-xs'

            numberOfLines={2}
          >
            {data?.delivery ? data?.delivery?.origin : ''}
          </Text>
        </View>
        <View className='flex-row items-center mb-2 gap-2'>
          <Feather
            name="map-pin"
            color={'gray'}
            size={12}
            style={styles.iconStyle}
          />
          <Text
            className='flex-1 text-muted font-poppins-light text-xs'

            numberOfLines={2}
          >
            {data?.delivery ? data?.delivery?.destination : ''}
          </Text>
        </View>
      </View>

      <HDivider />

      <View className='mt-2'>
        <View className="flex-row items-center">
          <Feather name="clock" color='gray' size={12} />
          <Text className="font-poppins-light text-sm text-muted ml-1">Estimated Delivery Time: {data?.delivery?.duration}</Text>
        </View>
      </View>



    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  iconStyle: {
    // marginTop: 2
  }
});
