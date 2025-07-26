import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ChatWrapper } from '@/components/ChatWrapper';
import { ChatProvider } from '@/context/chatContext';
import { Stack } from 'expo-router';


const ChatRootLayout = () => {
    return (
        <ChatWrapper>
            <ChatProvider>

                <Stack>

                    <Stack.Screen name='[cid]' />
                    <Stack.Screen name='thread/[cid]' />


                </Stack>
            </ChatProvider>
        </ChatWrapper>
    )
}

export default ChatRootLayout

const styles = StyleSheet.create({})