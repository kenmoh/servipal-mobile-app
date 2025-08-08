// import { Tabs } from 'expo-router';
import React, { useMemo } from "react";

import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useColorScheme, View } from "react-native";

import { useAuth } from "@/context/authContext";
import {
  createNativeBottomTabNavigator,
  NativeBottomTabNavigationEventMap,
  NativeBottomTabNavigationOptions,
} from "@bottom-tabs/react-navigation";
import { ParamListBase, TabNavigationState } from "@react-navigation/native";
import { Redirect, withLayoutContext } from "expo-router";

const BottomTabNavigator = createNativeBottomTabNavigator().Navigator;

export const Tabs = withLayoutContext<
  NativeBottomTabNavigationOptions,
  typeof BottomTabNavigator,
  TabNavigationState<ParamListBase>,
  NativeBottomTabNavigationEventMap
>(BottomTabNavigator);

export default function TabLayout() {
  const { user } = useAuth();

  const isTabBarItemHidden = user?.user_type === "dispatch" || user?.user_type === "rider" ? true : false;


  if (!user?.sub) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const theme = useColorScheme();
  const BG_COLOR = theme === "dark" ? HEADER_BG_DARK : HEADER_BG_LIGHT;

  // Memoize tab bar style to prevent re-creation
  const tabBarStyle = useMemo(
    () => ({
      backgroundColor: BG_COLOR,
    }),
    [BG_COLOR]
  );

  return (
    <View className="flex-1 bg-background">
      <Tabs
        tabBarStyle={tabBarStyle}
        tabBarActiveTintColor={"orange"}
        labeled={true}
      >
        <Tabs.Screen
          name="delivery"
          options={{
            title: "Delivery",
            tabBarIcon: () => require("@/assets/images/bike.svg"),
          }}
        />
        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: () => require("@/assets/images/utensils.svg"),
            tabBarItemHidden: isTabBarItemHidden
          }}
        />
        <Tabs.Screen
          name="laundry"
          options={{
            title: "Laundry",
            tabBarIcon: () => require("@/assets/images/washing-machine.svg"),
            tabBarItemHidden: isTabBarItemHidden
          }}
        />
        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Marketplace",
            tabBarIcon: () => require("@/assets/images/store.svg"),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: () => require("@/assets/images/user-round.svg"),
          }}
        />
      </Tabs>
      {/* </AppChatProvider> */}
    </View>
  );
}

// const TabBarLayout = () => {
//     const theme = useColorScheme()

//     const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT

//     const { user } = useAuth()
//     const activeColor = 'orange';
//     const iconColor = "#9BA1A6"
//     const text = "#ddd"

//     // Memoize tab bar style to prevent re-creation
//     const tabBarStyle = useMemo(() => ({
//         height: 110,
//         backgroundColor: BG_COLOR
//     }), [BG_COLOR]);

//     const tabBarItemStyle = useMemo(() => ({
//         padding: 15,
//         justifyContent: 'center' as const,
//         alignItems: 'center' as const,
//         flexDirection: 'column' as const,
//         backgroundColor: BG_COLOR
//     }), [BG_COLOR]);

//     const tabBarBadgeStyle = useMemo(() => ({
//         position: 'absolute' as const,
//         top: -12,
//         backgroundColor: 'orange',
//         color: 'white'
//     }), []);

//     // Memoize href conditions to prevent re-calculation
//     const isDispatchOrRider = useMemo(() =>
//         user?.user_type === 'dispatch' || user?.user_type === 'rider',
//         [user?.user_type]
//     );

//     return (
//         <Tabs
//             screenOptions={{

//                 tabBarActiveTintColor: activeColor,
//                 headerShown: false,
//                 headerTitleAlign: "center",
//                 headerTintColor: text,
//                 tabBarShowLabel: false,
//                 tabBarHideOnKeyboard: true,
//                 tabBarStyle: tabBarStyle,
//                 tabBarItemStyle: tabBarItemStyle,
//                 tabBarBadgeStyle: tabBarBadgeStyle,

//             }}

//         >
//             <Tabs.Screen name='delivery' options={{
//                 title: '',

//                 tabBarIcon: ({ focused, size }) => (
//                     <BikeIcon size={size} color={focused ? activeColor : iconColor} />
//                 ),
//             }} />
//             <Tabs.Screen name='food' options={{
//                 title: '',
//                 href: user?.user_type === 'dispatch' || user?.user_type === 'rider' ? null : undefined,

//                 tabBarIcon: ({ focused, size }) => (
//                     <Utensils size={size} color={focused ? activeColor : iconColor} />
//                 ),
//             }} />
//             <Tabs.Screen name='laundry' options={{
//                 title: '',
//                 href: user?.user_type === 'dispatch' || user?.user_type === 'rider' ? null : undefined,

//                 tabBarIcon: ({ focused, size }) => (
//                     <WashingMachine size={size} color={focused ? activeColor : iconColor} />
//                 ),
//             }} />

//             <Tabs.Screen name='profile' options={{
//                 title: '',

//                 tabBarIcon: ({ focused, size }) => (
//                     <Settings size={size} color={focused ? activeColor : iconColor} />
//                 ),
//             }} />

//         </Tabs>
//     )
// }

// export default TabBarLayout
