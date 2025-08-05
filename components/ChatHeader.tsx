import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

interface ChatHeaderProps {
    chatInfo: {
        name: string;
        avatar: string;
        online: boolean;
        lastSeen: string;
    };
    onMoreOptions: () => void;
}

const ChatHeader = ({ chatInfo, onMoreOptions }: ChatHeaderProps) => {
    const theme = useColorScheme();
    const isDark = theme === 'dark';

    const handleBack = () => {
        router.back();
    };

    return (
        <View className="flex-row items-center justify-between flex-1">
            {/* Left side - Back button and User info */}
            <View className="flex-row items-center flex-1">
                <TouchableOpacity onPress={handleBack} className="mr-3">
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={isDark ? 'white' : 'black'}
                    />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center flex-1">
                    <View className="relative">
                        <Image
                            source={{ uri: chatInfo.avatar }}
                            className="w-10 h-10 rounded-full"
                        />
                        {chatInfo.online && (
                            <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                        )}
                    </View>

                    <View className="ml-3 flex-1">
                        <Text className={`font-poppins-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                            {chatInfo.name}
                        </Text>
                        <Text className={`text-xs ${chatInfo.online
                            ? 'text-green-500'
                            : isDark ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {chatInfo.online ? 'Online' : `Last seen ${chatInfo.lastSeen}`}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Right side - More options */}
            <TouchableOpacity onPress={onMoreOptions} className="ml-2">
                <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={isDark ? 'white' : 'black'}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ChatHeader; 