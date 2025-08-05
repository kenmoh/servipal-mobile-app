
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useBottomNavigationHeight } from "@/utils/navigationHeight";
import { Ionicons } from "@expo/vector-icons";
import { useHeaderHeight } from "@react-navigation/elements";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

// Mock chat data for demonstration
const mockMessages = [
    {
        id: "1",
        text: "Hey! When will my order be delivered?",
        timestamp: "10:30 AM",
        isMyMessage: false,
        sender: {
            name: "John Doe",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        }
    },
    {
        id: "2",
        text: "Hi! Your order is scheduled for delivery tomorrow between 2-4 PM. We'll send you a notification when the rider is on the way.",
        timestamp: "10:32 AM",
        isMyMessage: true,
        sender: {
            name: "You",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        }
    },
    {
        id: "3",
        text: "Perfect! Thank you so much. Can you also confirm the delivery address?",
        timestamp: "10:35 AM",
        isMyMessage: false,
        sender: {
            name: "John Doe",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        }
    },
    {
        id: "4",
        text: "Of course! Your delivery address is: 123 Main Street, Apartment 4B, Lagos. Is this correct?",
        timestamp: "10:37 AM",
        isMyMessage: true,
        sender: {
            name: "You",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        }
    },
    {
        id: "5",
        text: "Yes, that's correct! Looking forward to receiving my order. Thanks again! 😊",
        timestamp: "10:40 AM",
        isMyMessage: false,
        sender: {
            name: "John Doe",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        }
    }
];

const MessageBubble = ({ message }: { message: any }) => {
    const theme = useColorScheme();
    const isDark = theme === 'dark';

    return (
        <View className={`flex-row ${message.isMyMessage ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
            {!message.isMyMessage && (
                <Image
                    source={{ uri: message.sender.avatar }}
                    className="w-8 h-8 rounded-full mr-2"
                />
            )}

            <View className={`max-w-[75%] ${message.isMyMessage ? 'order-2' : 'order-1'}`}>
                <View className={`px-4 py-3 rounded-2xl ${message.isMyMessage
                    ? 'bg-primary rounded-br-md'
                    : isDark
                        ? 'bg-gray-700 rounded-bl-md'
                        : 'bg-gray-100 rounded-bl-md'
                    }`}>
                    <Text className={`text-sm ${message.isMyMessage ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                        {message.text}
                    </Text>
                </View>

                <Text className={`text-xs mt-1 ${message.isMyMessage ? 'text-right' : 'text-left'
                    } ${isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {message.timestamp}
                </Text>
            </View>

            {message.isMyMessage && (
                <View className="order-1 ml-2">
                    <View className="w-8 h-8 rounded-full bg-primary justify-center items-center">
                        <Text className="text-white text-xs font-poppins-medium">
                            {message.sender.name.charAt(0)}
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const ChatInput = ({ onSend }: { onSend: (message: string) => void }) => {
    const [message, setMessage] = useState('');
    const theme = useColorScheme();
    const isDark = theme === 'dark';
    const bottomTabHeight = useBottomNavigationHeight();

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim());
            setMessage('');
        }
    };

    return (
        <View className={`flex-row items-end `} style={{ paddingBottom: 16 + bottomTabHeight }}>

            <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Type a message..."
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                multiline
                className="text-sm text-primary px-6"
                style={{ maxHeight: 100, width: '100%', borderBottomWidth: 1, borderBottomColor: 'gray' }}
            />


            <TouchableOpacity
                onPress={handleSend}
                disabled={!message.trim()}
                className="absolute bottom-[75px] right-6"
            >
                <Ionicons
                    name="send"
                    size={18}
                    color={message.trim() ? 'white' : isDark ? '#9CA3AF' : '#6B7280'}
                />
            </TouchableOpacity>
        </View>
    );
};

export default function ChatConversationScreen() {
    const headerHeight = useHeaderHeight();
    const bottomTabHeight = useBottomNavigationHeight();
    const { reportId } = useLocalSearchParams<{ reportId: string }>();
    const theme = useColorScheme();
    const isDark = theme === 'dark';
    const [messages, setMessages] = useState(mockMessages);
    const flatListRef = useRef<FlatList>(null);


    // Mock chat info - replace with actual data based on reportId
    const chatInfo = {
        name: "John Doe",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        online: true,
        lastSeen: "2 min ago"
    };

    const handleSendMessage = (text: string) => {
        const newMessage = {
            id: Date.now().toString(),
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMyMessage: true,
            sender: {
                name: "You",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
            }
        };

        setMessages(prev => [...prev, newMessage]);

        // Auto-scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleMoreOptions = () => {
        Alert.alert(
            "Chat Options",
            "What would you like to do?",
            [
                { text: "View Profile", onPress: () => console.log("View Profile") },
                { text: "Block User", onPress: () => console.log("Block User") },
                { text: "Report", onPress: () => console.log("Report") },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: "",
                    headerShadowVisible: false,
                    headerBackVisible: true,
                    headerTintColor: isDark ? 'white' : 'black',
                    headerStyle: {
                        backgroundColor: isDark ? HEADER_BG_DARK : HEADER_BG_LIGHT
                    },
                    headerRight: () => (
                        <TouchableOpacity onPress={handleMoreOptions} className="ml-2">
                            <Ionicons
                                name="ellipsis-vertical"
                                size={20}
                                color={isDark ? 'white' : 'black'}
                            />
                        </TouchableOpacity>
                    ),
                    headerLeft: () => <Avatar name={chatInfo.name} avatar={chatInfo.avatar} lastSeen={chatInfo.lastSeen} isDark={isDark} isOnline={chatInfo.online} />
                }}
            />
            <SafeAreaView className={`flex-1 ${isDark ? 'bg-background' : 'bg-background'}`}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={headerHeight / 6}
                >
                    {/* Messages */}
                    <FlatList
                        ref={flatListRef}
                        data={messages}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => <MessageBubble message={item} />}
                        showsVerticalScrollIndicator={false}
                        className="flex-1"
                        contentContainerStyle={{ paddingVertical: 10 }}
                        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
                    />

                    {/* Input - Fixed at bottom */}
                    <ChatInput onSend={handleSendMessage} />
                </KeyboardAvoidingView>
            </SafeAreaView>
        </>
    );
}

const Avatar = ({ avatar, isOnline, name, isDark, lastSeen }: { avatar: string, lastSeen: string, isOnline: boolean, name: string, isDark: boolean }) => {
    return (
        <TouchableOpacity className="flex-row items-center flex-1">
            <View className="">
                <Image
                    source={{ uri: avatar }}
                    className="w-10 h-10 rounded-full"
                />
                {isOnline && (
                    <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                )}
            </View>

            <View className="ml-3 flex-1">
                <Text className={`font-poppins-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                    {name}
                </Text>
                <Text className={`text-xs ${isOnline
                    ? 'text-green-500'
                    : isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                    {isOnline ? 'Online' : `Last seen ${lastSeen}`}
                </Text>
            </View>
        </TouchableOpacity>
    )
}
