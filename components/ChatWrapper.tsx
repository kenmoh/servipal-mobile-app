import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider, useCreateChatClient } from "stream-chat-expo";

import { useAuth } from "@/context/authContext";
import { chatApiKey } from "@/utils/chatConfig";

export const ChatWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, profile } = useAuth();

  if (!user || !profile) return null;

  const chatUser = {
    id: user?.sub,
    name:
      profile?.profile.full_name ||
      profile?.profile.business_name ||
      "Anonymous",
  };

  const chatTheme = {
    channelPreview: {
      container: {
        backgroundColor: "transparent",
      },
    },
  };

  const chatClient = useCreateChatClient({
    apiKey: chatApiKey,
    userData: chatUser,
    tokenOrProvider: user.chat_token,
  });

  // const client = StreamChat.getInstance(chatApiKey);

  // client.connectUser(chatUser, user.chat_token);


  if (!client) {
    return (
      <SafeAreaView
        className="bg-background"
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "white" }}>Loading chat UI ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <OverlayProvider value={{ style: chatTheme }}>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
};
