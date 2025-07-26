import React, { useContext } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { Channel, MessageInput, MessageList } from "stream-chat-expo";
import { router, Stack } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
import { ChatContext } from "@/context/chatContext";

export default function ChannelScreen() {
    const { channel, setThread, } = useContext(ChatContext);
    const headerHeight = useHeaderHeight();

    if (!channel) {
        return (
            <SafeAreaView>
                <Text>Loading chat ...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <Stack.Screen options={{ title: "Channel Screen" }} />
            <Channel channel={channel} keyboardVerticalOffset={headerHeight}>
                <MessageList
                    onThreadSelect={(thread) => {
                        setThread(thread);
                        router.push({
                            pathname: `/channel/[cid]/thread/[cid]`,
                            params: { cid: thread?.id! },
                        });

                    }}
                />
                <MessageInput />
            </Channel>
        </SafeAreaView>
    );
}