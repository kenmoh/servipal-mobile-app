import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, useColorScheme, View } from 'react-native';
import { useMessageContext } from 'stream-chat-expo';

const Message = () => {
    const { message, isMyMessage } = useMessageContext();
    const theme = useColorScheme();
    const isDark = theme === 'dark';

    const formatTime = (timestamp: string | Date) => {
        const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View className={`flex-row ${isMyMessage ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
            {!isMyMessage && (
                <View className="mr-2">
                    <View className="w-8 h-8 rounded-full bg-primary justify-center items-center">
                        <Text className="text-white text-xs font-poppins-medium">
                            {message.user?.name?.charAt(0) || 'U'}
                        </Text>
                    </View>
                </View>
            )}

            <View className={`max-w-[75%] ${isMyMessage ? 'order-2' : 'order-1'}`}>
                <View className={`px-4 py-3 rounded-2xl ${isMyMessage
                    ? 'bg-primary rounded-br-md'
                    : isDark
                        ? 'bg-gray-700 rounded-bl-md'
                        : 'bg-gray-100 rounded-bl-md'
                    }`}>
                    <Text className={`text-sm ${isMyMessage ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {message.text}
                    </Text>
                </View>

                <View className={`flex-row items-center mt-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {formatTime(message.created_at || new Date().toISOString())}
                    </Text>

                    {isMyMessage && (
                        <View className="ml-1">
                            <Ionicons
                                name="checkmark-done"
                                size={12}
                                color={isDark ? '#9CA3AF' : '#6B7280'}
                            />
                        </View>
                    )}
                </View>
            </View>

            {isMyMessage && (
                <View className="order-1 ml-2">
                    <View className="w-8 h-8 rounded-full bg-primary justify-center items-center">
                        <Text className="text-white text-xs font-poppins-medium">
                            Me
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default Message;