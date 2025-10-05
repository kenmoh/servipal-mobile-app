
import { useUserStore } from "@/store/userStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, useColorScheme, View } from "react-native";

const sort = { last_updated: -1 };
const options = {
    state: true,
    watch: true,
};

// Mock data for demonstration - replace with actual chat data
const mockChats = [
    {
        id: "1",
        reportId: "report_001",
        name: "John Doe",
        lastMessage: "Hey, when will my order be delivered?",
        timestamp: "2 min ago",
        unreadCount: 2,
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        online: true,
    },
    {
        id: "2",
        reportId: "report_002",
        name: "Sarah Wilson",
        lastMessage: "Thank you for the quick delivery!",
        timestamp: "1 hour ago",
        unreadCount: 0,
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        online: false,
    },
    {
        id: "3",
        reportId: "report_003",
        name: "Mike Johnson",
        lastMessage: "Is the product still available?",
        timestamp: "3 hours ago",
        unreadCount: 1,
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        online: true,
    },
    {
        id: "4",
        reportId: "report_004",
        name: "Emma Davis",
        lastMessage: "Can I get a discount on bulk order?",
        timestamp: "Yesterday",
        unreadCount: 0,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        online: false,
    },
];

const ChatItem = ({ chat, onPress }: { chat: any; onPress: () => void }) => {
    const theme = useColorScheme();
    const isDark = theme === 'dark';

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`flex-row items-center p-4 border-b ${isDark ? 'border-gray-700 bg-background' : 'border-gray-100 bg-background'
                }`}
        >
            {/* Avatar */}
            <View className="relative">
                <Image
                    source={{ uri: chat.avatar }}
                    className="w-12 h-12 rounded-full"
                />
                {chat.online && (
                    <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
            </View>

            {/* Chat Info */}
            <View className="flex-1 ml-4">
                <View className="flex-row items-center justify-between">
                    <Text className={`font-poppins-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {chat.name}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {chat.timestamp}
                    </Text>
                </View>

                <View className="flex-row items-center justify-between mt-1">
                    <Text
                        numberOfLines={1}
                        className={`flex-1 text-sm ${chat.unreadCount > 0
                            ? (isDark ? 'text-white font-poppins-medium' : 'text-gray-900 font-poppins-medium')
                            : (isDark ? 'text-gray-400' : 'text-gray-600')
                            }`}
                    >
                        {chat.lastMessage}
                    </Text>

                    {chat.unreadCount > 0 && (
                        <View className="ml-2 bg-primary rounded-full min-w-[20px] h-5 justify-center items-center">
                            <Text className="text-white text-xs font-poppins-medium">
                                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function ChatListScreen() {
    const theme = useColorScheme();
    const { user } = useUserStore();
    const isDark = theme === 'dark';

    if (!user) {
        router.replace("/sign-in");
        return null;
    }

    const filters = {
        members: { $in: [user.sub] },
        type: "messaging",
    };
    const memoizedFilters = useMemo(() => filters, []);

    const handleChatPress = (reportId: string) => {
        router.push({
            pathname: `/chat/[reportId]`,
            params: { reportId },
        });
    };

    return (
        <SafeAreaView className={`flex-1 ${isDark ? 'bg-background' : 'bg-background'}`}>
            {/* Header */}


            {/* Chat List */}
            <FlatList
                data={mockChats}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ChatItem chat={item} onPress={() => handleChatPress(item.reportId)} />
                )}
                showsVerticalScrollIndicator={false}
                className="flex-1"
            />

            {/* Empty State */}
            {mockChats.length === 0 && (
                <View className="flex-1 justify-center items-center px-8">
                    <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 justify-center items-center mb-4">
                        <Ionicons
                            name="chatbubbles-outline"
                            size={32}
                            color={isDark ? '#9CA3AF' : '#6B7280'}
                        />
                    </View>
                    <Text className={`text-lg font-poppins-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        No messages yet
                    </Text>
                    <Text className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                        Start a conversation with your customers or vendors
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
}