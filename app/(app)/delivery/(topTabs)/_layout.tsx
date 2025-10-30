import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme';

import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { Dimensions, StyleSheet, useColorScheme } from 'react-native';


const DeliveryTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

const DeliveryLayout = () => {
    const theme = useColorScheme()
    return (
   

            <DeliveryTabs
                initialRouteName="index"
                initialLayout={{
                    width: Dimensions.get('window').width,
                    // height: Dimensions.get('window').height
                }}

                screenOptions={{
                    tabBarLabelStyle: {
                        fontSize: 12,
                        textAlign: 'center',
                        textTransform: 'capitalize',
                        fontFamily: 'Poppins-Bold',

                    },

                    swipeEnabled: false,
                    tabBarActiveTintColor: theme === 'dark' ? '#fff' : '#000',
                    tabBarInactiveTintColor: theme === 'dark' ? '#aaa' : '#555',
                    tabBarAndroidRipple: { borderless: false },
                    tabBarPressOpacity: 0,
                    tabBarIndicatorStyle: {
                        backgroundColor: 'orange',
                        height: 3,
                    },
                    tabBarStyle: {
                        backgroundColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                        borderBottomColor: theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        elevation: 0,
                        shadowOpacity: 0,
                    }
                }}
            >
                <DeliveryTabs.Screen
                    name="index"
                    options={{
                        tabBarLabel: 'Delivery',
                    }}
                />
                <DeliveryTabs.Screen
                    name="orders"
                    options={{
                        tabBarLabel: 'My Orders',
                    }}
                />
            </DeliveryTabs>
    
    )
}

export default DeliveryLayout