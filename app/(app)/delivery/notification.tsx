import React from "react";
import {
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import {
    deleteNotification,
    fetchCurrentUserReports,
    fetchNotificationBadgeCount,
    fetchNotificationStatistics,
    markAllNotificationsRead,
    markReportRead,
} from "@/api/report";
import AppButton from "@/components/AppButton";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/authContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";

const NotificationScreen = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // Fetch notifications
    const {
        data: notifications = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ["notifications", user?.sub],
        queryFn: () => fetchCurrentUserReports(user?.sub as string),
    });

    // Fetch badge count
    const { data: badgeData } = useQuery({
        queryKey: ["notification-badge"],
        queryFn: fetchNotificationBadgeCount,
    });

    // Fetch stats
    const { data: stats } = useQuery({
        queryKey: ["notification-stats"],
        queryFn: fetchNotificationStatistics,
    });



    // Mark as read mutation
    const markReadMutation = useMutation({
        mutationFn: markReportRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notification-badge"] });
        },
    });

    // Mark all as read mutation
    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notification-badge"] });
        },
    });

    // Delete notification mutation (admin only, not shown in UI)
    const deleteMutation = useMutation({
        mutationFn: deleteNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const handleMarkRead = (id: string) => {
        markReadMutation.mutate(id);
    };

    const handleMarkAllRead = () => {
        markAllReadMutation.mutate();
    };

    if (isLoading) {
        return <LoadingIndicator />;
    }

    return (
        <View className="flex-1 bg-background p-3">
            <View className="flex-row justify-between items-center ">

                <View className="gap-3 mb-2">
                    <Text className="text-muted font-poppins-medium text-sm">
                        Unread: {badgeData?.unread_notifications ?? 0}
                    </Text>
                    {stats && (
                        <Text className="text-icon-default">
                            Total: {stats.total_notifications}
                        </Text>
                    )}
                </View>


                {/* <TouchableOpacity onPress={handleMarkAllRead}>
                    <Text className="font-poppins-light underline text-muted">Mark all as read</Text>
                </TouchableOpacity>*/}

            </View>

            <FlatList
                data={notifications || []}
                keyExtractor={(item) => item.id}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-input w-full self-center py-2 px-5 rounded-md my-1"
                        onPress={() => {
                            router.push({
                                pathname: "/notification-detail/[notificationId]",
                                params: {
                                    notificationId: item?.id,
                                },
                            });
                            handleMarkRead(item.id);
                        }}
                    >
                        <View


                        >
                            <View className="flex-row justify-between items-center">
                                <Text
                                    className="text-muted font-poppins-medium text-sm"
                                >
                                    {item.report_type || "Report"}
                                </Text>
                                {!item.report_status && (
                                    <AppButton
                                        title={
                                            markReadMutation.isPending ? "Marking..." : "Mark as read"
                                        }
                                        onPress={() => handleMarkRead(item.id)}
                                        disabled={markReadMutation.isPending}
                                    />
                                )}
                            </View>
                            <Text
                                className={`text-${item.is_read ? "muted" : "white"
                                    } mt-2 font-poppins-light text-xs`}
                            >
                                {item.description}
                            </Text>
                            <Text
                                className={`text-${item.is_read ? "muted" : "rgba(255,255,255,0.7)"
                                    } text-[12px] mt-1 font-poppins-light text-xs`}
                            >
                                {new Date(item.created_at).toLocaleString()}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text className="text-center text-icon-default mt-10">
                        No notifications yet.
                    </Text>
                }
            />
        </View>
    );
};

export default NotificationScreen;
