import { useLocalSearchParams } from "expo-router";
import React, { useRef, useState, useEffect } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Animated,
} from "react-native";

import { SendHorizonal } from "lucide-react-native";

import { addMessage, fetchReport } from "@/api/report";
import { useToast } from "@/components/ToastProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { z } from "zod";

const roleColor: any = {
    customer: "#4F8EF7",
    admin: "#F7B731",
    rider: "#20BF6B",
    laundry_vendor: "#9B59B6",
    moderator: "#E74C3C",
    dispatch: "#F39C12",
    reporter: "#4F8EF7",
    reportee: "#E74C3C",
    restaurant_vendor: "#9CB9D1",
};

const MIN_INPUT_HEIGHT = 44;
const MAX_INPUT_HEIGHT = 120;

const messageSchema = z.object({
    content: z
        .string()
        .min(1, "Message cannot be empty")
        .max(500, "Message too long"),
});

type MessageFormData = z.infer<typeof messageSchema>;

// Optimistic message type
interface OptimisticMessage {
    id: string;
    content: string;
    date: string;
    role: string;
    sender: {
        name: string;
        avatar: string;
    };
    isOptimistic?: boolean;
    isFailed?: boolean;
    optimisticId?: string; // Track original optimistic ID
}

const NotificationDetails = () => {
    const { notificationId, reportTag, thread, complainantId, reportStatus } =
        useLocalSearchParams();
    
    const [inputHeight, setInputHeight] = useState(MIN_INPUT_HEIGHT);
    const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
    const [pendingOptimisticIds, setPendingOptimisticIds] = useState<string[]>([]);
    const flatListRef = useRef<FlatList>(null);
    const { showError, showSuccess } = useToast();
    const queryClient = useQueryClient();

    // Fetch thread data
    const {
        data: messages,
        refetch: refetchThread,
    } = useQuery({
        queryKey: ["thread", notificationId],
        queryFn: () => fetchReport(notificationId as string),
        enabled: !!notificationId,
    });

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<MessageFormData>({
        resolver: zodResolver(messageSchema),
        mode: "onBlur",
        defaultValues: {
            content: "",
        },
    });

    const watchedContent = watch("content");

    // Combine real messages with optimistic messages - exclude server messages that match pending optimistic ones
    const allMessages = React.useMemo(() => {
        const realMessages = messages?.thread || [];
        
        // Filter out any real messages that might be duplicates of our pending optimistic messages
        const filteredRealMessages = realMessages.filter(realMsg => {
            // Check if this real message matches any pending optimistic message
            const hasPendingOptimistic = optimisticMessages.some(optMsg => 
                optMsg.isOptimistic && 
                optMsg.content.trim() === realMsg.content.trim() &&
                Math.abs(new Date(optMsg.date).getTime() - new Date(realMsg.date).getTime()) < 10000 // Within 10 seconds
            );
            return !hasPendingOptimistic;
        });
        
        return [...filteredRealMessages, ...optimisticMessages];
    }, [messages?.thread, optimisticMessages]);

    const sendMessageMutation = useMutation({
        mutationFn: (data: MessageFormData) =>
            addMessage(notificationId as string, {
                content: data.content,
            }),
        onSuccess: (serverResponse, variables) => {
            // Find the optimistic message that was sent
            const optimisticMessage = optimisticMessages.find(msg => 
                msg.content === variables.content && msg.isOptimistic
            );
            
            if (optimisticMessage) {
                // Remove from pending list
                setPendingOptimisticIds(prev => 
                    prev.filter(id => id !== optimisticMessage.optimisticId)
                );
                
                // Remove the optimistic message
                setOptimisticMessages(prev => 
                    prev.filter(msg => msg.id !== optimisticMessage.id)
                );
            }
            
            // Refetch to get the real message from server
            refetchThread();
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
        },
        onError: (error: any, variables) => {
            // Mark optimistic message as failed
            setOptimisticMessages(prev => 
                prev.map(msg => 
                    msg.content === variables.content && msg.isOptimistic
                        ? { ...msg, isFailed: true }
                        : msg
                )
            );
            
            // Remove from pending list
            const failedMessage = optimisticMessages.find(msg => 
                msg.content === variables.content && msg.isOptimistic
            );
            if (failedMessage?.optimisticId) {
                setPendingOptimisticIds(prev => 
                    prev.filter(id => id !== failedMessage.optimisticId)
                );
            }
            
            // Remove failed message after 3 seconds
            setTimeout(() => {
                setOptimisticMessages(prev => 
                    prev.filter(msg => msg.content !== variables.content)
                );
            }, 3000);
            
            showError("Error", error?.message || "Failed to send message");
        },
    });

    const onSubmit = (data: MessageFormData) => {
        if (!data.content.trim()) return;

        // Create unique optimistic ID
        const optimisticId = `optimistic-${Date.now()}-${Math.random()}`;

        // Create optimistic message
        const optimisticMessage: OptimisticMessage = {
            id: optimisticId,
            optimisticId: optimisticId,
            content: data.content,
            date: new Date().toISOString(),
            role: "customer", // Adjust based on your user role logic
            sender: {
                name: "You", // Adjust based on your user data
                avatar: "https://via.placeholder.com/32", // Adjust based on your user data
            },
            isOptimistic: true,
        };

        // Add to pending optimistic IDs
        setPendingOptimisticIds(prev => [...prev, optimisticId]);

        // Add optimistic message immediately
        setOptimisticMessages(prev => [...prev, optimisticMessage]);
        
        // Clear form
        reset();
        
        // Send message in background
        sendMessageMutation.mutate(data);
        
        // Auto-scroll to bottom
        setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
    };

    // Auto-scroll when messages change
    useEffect(() => {
        if (allMessages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [allMessages.length]);

    const renderItem = ({ item, index }: { item: OptimisticMessage; index: number }) => {
        const isOptimistic = item.isOptimistic;
        const isFailed = item.isFailed;
        
        return (
            <View style={styles.messageContainer}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: item?.sender?.avatar }}
                        style={[
                            styles.avatar,
                            {
                                borderColor: roleColor[item?.role] || "#ccc",
                                opacity: isFailed ? 0.5 : isOptimistic ? 0.8 : 1,
                            }
                        ]}
                    />
                </View>

                <View style={styles.messageContent}>
                    <View style={styles.messageHeader}>
                        <Text
                            style={[
                                styles.senderName,
                                { 
                                    color: roleColor[item?.role] || "#fff",
                                    opacity: isFailed ? 0.5 : isOptimistic ? 0.8 : 1,
                                }
                            ]}
                        >
                            {item?.role === "moderator" ? "ServiPal" : item?.sender?.name}
                        </Text>
                        <Text
                            style={[
                                styles.roleBadge,
                                {
                                    color: roleColor[item?.role] || "#aaa",
                                    opacity: isFailed ? 0.5 : isOptimistic ? 0.8 : 1,
                                }
                            ]}
                        >
                            {item?.role?.toUpperCase()}
                        </Text>
                        {isFailed && (
                            <Text style={styles.failedBadge}>FAILED</Text>
                        )}
                        {isOptimistic && !isFailed && (
                            <View style={styles.sendingIndicator}>
                                <View style={styles.sendingDot} />
                                <Text style={styles.sendingText}>sending</Text>
                            </View>
                        )}
                    </View>
                    
                    <Text
                        style={[
                            styles.timestamp,
                            { opacity: isFailed ? 0.5 : isOptimistic ? 0.8 : 1 }
                        ]}
                    >
                        {new Date(item.date).toLocaleString()}
                    </Text>
                    
                    <View
                        style={[
                            styles.messageBubble,
                            { 
                                opacity: isFailed ? 0.5 : isOptimistic ? 0.8 : 1,
                                borderLeftWidth: isFailed ? 3 : 0,
                                borderLeftColor: isFailed ? "#E74C3C" : "transparent",
                            }
                        ]}
                    >
                        <Text style={styles.messageText}>
                            {item.content}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubtext}>Start the conversation</Text>
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior="padding"
            keyboardVerticalOffset={50}
            style={styles.container}
        >
            <View style={styles.chatContainer}>
                <FlatList
                    ref={flatListRef}
                    data={allMessages}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={[
                        styles.messagesContainer,
                        allMessages.length === 0 && styles.emptyMessagesContainer
                    ]}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={renderEmptyState}
                    maintainVisibleContentPosition={{
                        minIndexForVisible: 0,
                        autoscrollToTopThreshold: 10,
                    }}
                />

                {/* Input area */}
                {reportStatus !== "resolved" && (
                    <View style={styles.inputContainer}>
                        <View style={[styles.inputWrapper, { minHeight: inputHeight + 20 }]}>
                            <Controller
                                control={control}
                                name="content"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <TextInput
                                        value={value}
                                        onChangeText={onChange}
                                        onBlur={onBlur}
                                        placeholder="Type a message..."
                                        placeholderTextColor="#888"
                                        multiline
                                        style={[
                                            styles.textInput,
                                            { height: Math.max(inputHeight, MIN_INPUT_HEIGHT) }
                                        ]}
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
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: watchedContent?.trim() 
                                            ? "#4F8EF7" 
                                            : "#444",
                                    }
                                ]}
                                onPress={handleSubmit(onSubmit)}
                                disabled={!watchedContent?.trim() || sendMessageMutation.isPending}
                            >
                                <SendHorizonal
                                    color="white"
                                    size={20}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a1a1a",
    },
    chatContainer: {
        flex: 1,
    },
    messagesContainer: {
        padding: 16,
        paddingBottom: 100, // Space for input
        flexGrow: 1,
    },
    emptyMessagesContainer: {
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        paddingVertical: 40,
    },
    emptyStateText: {
        color: "#666",
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        color: "#888",
        fontSize: 14,
    },
    messageContainer: {
        flexDirection: "row",
        marginBottom: 35,
        alignItems: "flex-start",
    },
    avatarContainer: {
        width: 44,
        alignItems: "center",
        marginRight: 12,
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: "#23272f",
    },
    messageContent: {
        flex: 1,
    },
    messageHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
        flexWrap: "wrap",
    },
    senderName: {
        fontWeight: "600",
        fontSize: 14,
        marginRight: 8,
    },
    roleBadge: {
        fontSize: 10,
        fontWeight: "400",
        letterSpacing: 1,
        backgroundColor: "#23272f",
        borderRadius: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 8,
    },
    sendingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 4,
    },
    sendingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#4F8EF7",
        marginRight: 4,
        opacity: 0.8,
    },
    sendingText: {
        fontSize: 9,
        color: "#4F8EF7",
        opacity: 0.8,
    },
    failedBadge: {
        fontSize: 9,
        color: "#E74C3C",
        backgroundColor: "rgba(231, 76, 60, 0.1)",
        borderRadius: 4,
        paddingHorizontal: 4,
        paddingVertical: 1,
        marginRight: 4,
    },
    timestamp: {
        color: "#666",
        fontSize: 10,
        marginBottom: 8,
    },
    messageBubble: {
        backgroundColor: "#2a2a2a",
        borderRadius: 12,
        padding: 12,
        marginTop: 4,
    },
    messageText: {
        color: "#e0e0e0",
        fontSize: 14,
        lineHeight: 20,
    },
    inputContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#1a1a1a",
        borderTopWidth: 1,
        borderTopColor: "#333",
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 20,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        backgroundColor: "#2a2a2a",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: "#333",
        marginBottom: 30
    },
    textInput: {
        flex: 1,
        color: "white",
        fontSize: 14,
        maxHeight: MAX_INPUT_HEIGHT,
        textAlignVertical: "top",
        paddingTop: 8,
        paddingBottom: 8,
        paddingRight: 12,
    },
    sendButton: {
        padding: 8,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 8,
    },
});

export default NotificationDetails;