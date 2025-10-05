import { Ionicons } from '@expo/vector-icons';
import { Bike } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import HDivider from './HDivider';

interface DeliveryCardProps {
  trackingId: string;
  status: 'In progress' | 'Pending' | 'Delivered';
  fromLocation: string;
  toLocation: string;
  startTime: string;
  estimatedTime: string;
  receiverName: string;
  receiverImage: string;
  dueDate: string;

  itemTypeIcon: React.ReactNode;
}

export default function DeliveryCard({
  trackingId,
  status,
  fromLocation,
  toLocation,
  startTime,
  estimatedTime,
  receiverName,
  receiverImage,
  dueDate,

  itemTypeIcon,
}: DeliveryCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'In progress': return 'bg-orange-100 text-orange-600';
      case 'Pending': return 'bg-gray-100 text-gray-600';
      case 'Delivered': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <View className="bg-input rounded-2xl p-4 mb-4 shadow-sm w-[95%] self-center my-2">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-2">
          {/* <Ionicons name="cube-outline" size={16} color="white" /> */}
          {itemTypeIcon}

          <Text className="font-poppins-medium text-primary">{trackingId}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor()}`}>
          <Text className="text-xs font-medium">{status}</Text>
        </View>
        <Text className="text-muted text-sm">Due: {dueDate}</Text>
      </View>

      {/* Route */}
      <View className="flex-row self-center gap-1 mb-4 items-center justify-between">
        <View className="w-3 h-3 bg-green-600 rounded-full" />
        {/* <View className="w-[42.5%] h-[0.5px] bg-gray-700" /> */}
        <HDivider width={'42.5%'} />
        <Bike size={18} color={'gray'} />

        {/* <View className="w-[42.5%] h-[0.5px] bg-gray-700" /> */}
        <HDivider width={'42.5%'} />
        <View className="w-3 h-3 bg-gray-400 rounded-full" />

      </View>
      <View className="flex-row  justify-between mb-2">
        <Text className="text-muted font-poppins-light text-sm  flex-1">kkkkkk jjjj{fromLocation}</Text>
        <Text className="text-muted font-poppins-light text-sm text-right flex-1 ">{toLocation}</Text>
      </View>

      {/* Timing */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="font-poppins-light text-sm text-muted ml-1">Trip started: {startTime}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="font-poppins-light text-sm text-muted ml-1">Estimated Arrival: {estimatedTime}</Text>
        </View>
      </View>

      {/* Receiver */}
      <HDivider />
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Image
            source={{ uri: receiverImage }}
            className="w-10 h-10 rounded-full mr-3"
          />
          <View>
            <Text className="font-poppins text-sm text-muted">{receiverName}</Text>
            <Text className="text-gray-500 text-sm">Sender</Text>
          </View>
        </View>
        <View className="flex-row">
          {/* <TouchableOpacity className="w-10 h-10 bg-profile-card rounded-full items-center justify-center mr-2">
            <Ionicons name="chatbubble-outline" size={18} color="#6B7280" />
          </TouchableOpacity> */}
          <TouchableOpacity className="w-10 h-10 bg-profile-card rounded-full items-center justify-center">
            <Ionicons name="call-outline" size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
