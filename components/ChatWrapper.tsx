import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { OverlayProvider, Chat, useCreateChatClient } from 'stream-chat-expo';
import { SafeAreaView } from "react-native-safe-area-context";

import {
    chatApiKey,
    chatUserName,

} from "@/utils/chatConfig";
import { useAuth } from "@/context/authContext";




export const ChatWrapper = ({ children }: { children: React.ReactNode }) => {
    const { user, profile } = useAuth()
    // const [token, setToken] = useState<string | null>(null);

    // useEffect(() => {
    //     authStorage.getToken().then(setToken);
    // }, []);
    if (!user || !profile) return null

    const chatUser = {
        id: user?.sub,
        name: profile?.profile.full_name || profile?.profile.business_name,
    };


    const chatTheme = {
        channelPreview: {
            container: {
                backgroundColor: 'transparent',
            }
        }
    };

    const chatClient = useCreateChatClient({
        apiKey: chatApiKey,
        userData: chatUser,
        tokenOrProvider: user.account_status,
    });

    if (!chatClient) {
        return (
            <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white' }} >Loading chat UI ...</Text>
            </SafeAreaView>
        );
    }

    return <OverlayProvider value={{ style: chatTheme }}>
        <Chat client={chatClient} >
            {children}
        </Chat>
    </OverlayProvider>;
};