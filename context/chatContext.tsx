/**
 * ChatProvider.tsx
 *
 * This provider integrates Stream Chat functionality into the application.
 * It manages the connection to Stream's chat service, handling user authentication
 * and providing the chat client to child components.
 */
import { User } from "@/types/user-types";
import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";

// Initialize the Stream Chat client with the API key from environment variables
const client = StreamChat.getInstance(
  process.env.EXPO_PUBLIC_STREAM_APP_API_KEY as string
);

/**
 * Custom theme configuration for the Stream Chat UI components
 * Makes channel previews have a transparent background to match app styling
 */
const chatTheme = {
  channelPreview: {
    container: {
      backgroundColor: "transparent",
    },
  },
};

/**
 * Provider component that initializes and manages the Stream Chat connection
 * Connects the current user to Stream Chat using their authentication details
 */
export default function AppChatProvider({ children }: PropsWithChildren) {
  // Track whether the chat client is ready (connected)
  const [isReady, setIsReady] = useState(false);
  // Get authentication state from AuthProvider
  const { user, profile } = useUserStore();;
  const typedUser = user as User | null;
  const theme = useColorScheme()

  // Connect to Stream Chat when the user is authenticated
  useEffect(() => {
    // Skip if user is not authenticated
    if (!user) {
      return;
    }

    /**
     * Connect the current user to Stream Chat using their ID and token
     */
    const connectUser = async () => {
      if (!typedUser || !typedUser.chat_token) {
        console.error("User or chat token is missing");
        return;
      }

      await client.connectUser(
        {
          id: typedUser.sub,
          name: profile?.profile.full_name || profile?.profile.business_name,
        },
        typedUser.chat_token
      );
      setIsReady(true);
    };

    connectUser();

    // Cleanup function to disconnect user when component unmounts
    // or when authentication state changes
    return () => {
      if (isReady) {
        client.disconnectUser();
      }
      setIsReady(false);
    };
  }, [user]);

  // Show loading indicator while connecting to Stream Chat
  if (!isReady) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size={'large'} color={theme === 'dark' ? 'white' : 'gray'} />
      </View>
    );
  }

  // Provide Stream Chat context to child components
  return (
    <OverlayProvider value={{ style: chatTheme }}>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
}

// import React, { PropsWithChildren, useState } from "react";
// import { DefaultChannelData, DefaultThreadData } from "stream-chat-expo";

// export const ChatContext = React.createContext<{
//   channel: DefaultChannelData | null;
//   setChannel: React.Dispatch<React.SetStateAction<DefaultChannelData | null>>;
//   thread: DefaultThreadData | null;
//   setThread: React.Dispatch<React.SetStateAction<DefaultThreadData | null>>;
// }>({
//   channel: null,
//   setChannel: () => {},
//   thread: null,
//   setThread: () => {},
// });

// export const AppChatProvider = ({ children }: PropsWithChildren) => {
//   const [channel, setChannel] = useState<DefaultChannelData | null>(null);
//   const [thread, setThread] = useState<DefaultThreadData | null>(null);

//   return (
//     <ChatContext.Provider value={{ channel, setChannel, thread, setThread }}>
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChatContext = () => React.useContext(ChatContext);
