import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from "react-native";

import { SendHorizonal } from "lucide-react-native";

import { addMessage, fetchReport } from "@/api/report";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Notifier, NotifierComponents } from "react-native-notifier";
import { z } from "zod";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";


const DUMMY_THREAD = [
    {
        id: "1",
        sender: {
            name: "Jane Doe",
            role: "reporter",
            avatar: "https://ui-avatars.com/api/?name=Jane+Doe",
        },
        content: "There was an issue with my delivery.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
        id: "2",
        sender: {
            name: "Admin",
            role: "admin",
            avatar: "https://ui-avatars.com/api/?name=Admin",
        },
        content: "Thank you for reporting. Can you provide more details?",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString(),
    },
    {
        id: "3",
        sender: {
            name: "John Smith",
            role: "reportee",
            avatar: "https://ui-avatars.com/api/?name=John+Smith",
        },
        content:
            "I delivered as instructed. Please clarify the issue. I want to understand what went wrong so I can improve my service. I followed all the delivery instructions provided and delivered the package on time to the specified location.",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    },
    {
        id: "4",
        sender: {
            name: "Jane Doe",
            role: "reporter",
            avatar: "https://ui-avatars.com/api/?name=Jane+Doe",
        },
        content:
            "The package was wet when I received it. It seems like it was left in the rain or got exposed to water during transport. The contents inside were also damaged due to the moisture. This is very disappointing as the items were expensive and now they are ruined.",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
];

const roleColor: any = {
    customer: "#4F8EF7",      // Blue
    admin: "#F7B731",         // Orange/Yellow
    rider: "#20BF6B",         // Green
    laundry_vendor: "#9B59B6", // Purple
    moderator: "#E74C3C",     // Red
    dispatch: "#F39C12",      // Orange
    reporter: "#4F8EF7",      // Blue (for report threads)
    reportee: "#E74C3C",      // Red (for report threads)
    restaurant_vendor: "#9CB9D1", // Purple
};

const MIN_INPUT_HEIGHT = 40;
const MAX_INPUT_HEIGHT = 120;
const INPUT_PADDING = 20; // Total padding around input area

const messageSchema = z.object({
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(500, "Message too long"),
});

type MessageFormData = z.infer<typeof messageSchema>;

const NotificationDetails = () => {
    const { notificationId, reportTag, thread, complainantId, reportStatus } =
        useLocalSearchParams();
    const [input, setInput] = useState("");
    const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
    const [isTyping, setIsTyping] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const theme = useColorScheme();

    const queryClient = useQueryClient();

    // Fetch thread data for real-time updates
    const {
        data: messages,
        refetch: refetchThread,
    } = useQuery({
        queryKey: ["thread", notificationId],
        queryFn: () => fetchReport(notificationId as string),
        // refetchInterval: 5000,
        enabled: !!notificationId,
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<MessageFormData>({
        resolver: zodResolver(messageSchema),
        mode: "onBlur",
        defaultValues: {
            content: "",
        },
    });

    const sendMessageMutation = useMutation({
        mutationFn: (data: MessageFormData) =>
            addMessage(notificationId as string, {
                content: data.content,
            }),
        onSuccess: (data) => {
            // Refetch thread data immediately
            refetchThread();

            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });

            // Notifier.showNotification({
            //     title: "Success",
            //     description: "Message sent successfully",
            //     Component: NotifierComponents.Alert,
            //     componentProps: { alertType: "success" },
            // });
        },
        onError: (error: any) => {
            reset();
            Notifier.showNotification({
                title: "Error",
                description: error?.message || "Failed to send message",
                Component: NotifierComponents.Alert,
                componentProps: { alertType: "error" },
            });
        },
    });

    const onSubmit = (data: MessageFormData) => {
        reset();
        setIsTyping(false);
        sendMessageMutation.mutate(data);
    };

    const handleInputFocus = () => {
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    const handleInputChange = (text: string) => {
        setIsTyping(text.length > 0);
    };

    const renderItem = ({ item, index }: any) => {
        const isLastItem = index === (messages?.thread?.length ?? 0) - 1;
        // Calculate dynamic bottom margin based on current input height
        const dynamicMargin = isLastItem ? inputHeight + INPUT_PADDING + 80 : 24;

        return (
            <View className={`flex-row items-start mb-${dynamicMargin}`} >
                <View className="items-center w-[44px]" >
                    <Image
                        source={{ uri: item?.sender?.avatar }}
                        style={{
                            width: 32,
                            objectFit: "cover",
                            height: 32,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: roleColor[item?.role] || "#ccc",
                            backgroundColor: "#23272f",
                        }}
                    />
                </View>

                <View className="flex-1 ml-0 p-0">
                    <View className="flex-row items-center gap-8">
                        <Text
                            style={{
                                fontWeight: "bold",
                                color: roleColor[item?.role] || "#fff",
                                fontSize: 16,
                            }}
                        >
                            {item?.role === "admin" ? "ServiPal" : item?.sender?.name}
                        </Text>
                        <Text
                            style={{
                                fontSize: 10,
                                color: roleColor[item?.role] || "#aaa",
                                fontWeight: "400",
                                letterSpacing: 1,
                                backgroundColor: "#23272f",
                                borderRadius: 6,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                marginLeft: 2,
                            }}
                        >
                            {item?.role?.toUpperCase()}
                        </Text>
                    </View>
                    <Text
                        style={{
                            fontSize: 11,
                            color: "#aaa",
                            marginTop: 2,
                            marginBottom: 2,
                            alignSelf: "flex-start",
                        }}
                    >
                        {new Date(item.date).toLocaleString()}
                    </Text>
                    <View
                        className="elevation-sm bg-[#23272f] rounded-lg p-12 mt-2"

                    >
                        <Text
                            style={{
                                color: "#eaeaea",
                                fontSize: 15,
                                lineHeight: 22,
                            }}
                        >
                            {item.content}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            behavior={"padding"}
            keyboardVerticalOffset={50}
            style={styles.content}
        >
            <View className="bg-background flex-1 w-[95%] self-center"

            >
                <FlatList
                    ref={flatListRef}
                    data={messages?.thread || []}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                        padding: 20,
                        flexGrow: 1,
                    }}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() => {
                        // Auto-scroll to bottom when content changes
                        setTimeout(() => {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                    }}
                />

                {/* Input area and typing indicator container */}
                <View
                    style={{
                        position: "absolute",
                        left: 10,
                        right: 10,
                        bottom: 50,
                    }}
                >
                    {/* Typing Indicator */}
                    {isTyping && (
                        <View className="flex-row items-start mb-5 px-10"

                        >
                            <View className="flex-row items-center gap-x-4">
                                <Text className="text-gray-300 text-xs" >typing</Text>
                                <View className="flex-row gap-2 gap-x-1">
                                    <View
                                        style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: "#eaeaea",
                                            opacity: 0.6,
                                        }}
                                    />
                                    <View
                                        style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: "#eaeaea",
                                            opacity: 0.8,
                                        }}
                                    />
                                    <View
                                        style={{
                                            width: 4,
                                            height: 4,
                                            borderRadius: 2,
                                            backgroundColor: "#eaeaea",
                                            opacity: 1,
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Input area */}
                    {reportStatus !== "resolved" && (
                        <View
                            className="bg-background"
                            style={{

                                flexDirection: "row",
                                alignItems: "flex-end",
                                padding: 10,
                                borderRadius: 20,
                                borderColor: "#23272f",
                                minHeight: MIN_INPUT_HEIGHT + INPUT_PADDING,
                                paddingHorizontal: 15,
                            }}
                        >
                            <Controller
                                control={control}
                                name="content"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={(text) => {
                                            onChange(text);
                                            handleInputChange(text);
                                        }}
                                        onBlur={onBlur}
                                        placeholder="Type a message..."
                                        placeholderTextColor="#888"
                                        multiline
                                        style={{
                                            flex: 1,
                                            minHeight: MIN_INPUT_HEIGHT,
                                            maxHeight: MAX_INPUT_HEIGHT,
                                            height: inputHeight,
                                            color: "white",
                                            fontSize: 14,
                                            textAlignVertical: "top",
                                            paddingTop: 10,
                                            paddingBottom: 10,
                                        }}
                                        onFocus={handleInputFocus}
                                        onContentSizeChange={(e) => {
                                            const newHeight = Math.min(
                                                MAX_INPUT_HEIGHT,
                                                Math.max(
                                                    MIN_INPUT_HEIGHT,
                                                    e.nativeEvent.contentSize.height
                                                )
                                            );
                                            setInputHeight(newHeight);
                                        }}
                                    />
                                )}
                            />
                            <TouchableOpacity
                                className={`${sendMessageMutation.isPending ? "bg-transparent" : "bg-button-primary"}`}
                                onPress={handleSubmit(onSubmit)}
                                hitSlop={25}
                                disabled={sendMessageMutation.isPending}
                                style={{
                                    padding: 8,
                                    borderRadius: 20,

                                }}
                            >
                                <SendHorizonal
                                    className={`${sendMessageMutation.isPending ? "text-icon-default" : "bg-button-primary-transparent"}`}

                                    size={20}
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default NotificationDetails;

const styles = StyleSheet.create({
    content: {
        flex: 1,
        // maxHeight: 600,
    },
});
