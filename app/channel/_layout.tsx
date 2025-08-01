import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, useColorScheme } from "react-native";

const ChatRootLayout = () => {
  const theme = useColorScheme();
  const HEADER_BG = theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;
  return (
    <Stack
      screenOptions={{
        headerTintColor: theme === "dark" ? "white" : "black",

        headerStyle: {
          backgroundColor: HEADER_BG,
        },
      }}
    >
      <Stack.Screen name="[cid]/index" />
      <Stack.Screen
        name="index"
        options={{
          headerShadowVisible: false,
          title: "Messages",
          headerTintColor: theme === "dark" ? "white" : "black",
          headerStyle: {
            backgroundColor: HEADER_BG,
          },
        }}
      />
      <Stack.Screen name="[cid]/thread/[cid]/index"
      />
    </Stack>
  );
};

export default ChatRootLayout;

const styles = StyleSheet.create({});
