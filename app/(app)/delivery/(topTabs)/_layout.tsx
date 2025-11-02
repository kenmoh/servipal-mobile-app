import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { withLayoutContext } from "expo-router";
import { Dimensions, StyleSheet, useColorScheme } from 'react-native';
import { useUserStore } from "@/store/userStore";

const DeliveryTabs = withLayoutContext(createMaterialTopTabNavigator().Navigator);

const DeliveryLayout = () => {
    const theme = useColorScheme();
    const { user, setisReassign } = useUserStore();
    
    // Determine if user should see all tabs
    // const showAllTabs = user?.user_type !== 'dispatch' || user?.user_type !== 'rider';
    // const showAllTabs = user?.user_type !== 'dispatch' && user?.user_type !== 'rider';
    const showAllTabs = !['laundry_vendor', 'customer', 'restaurant_vendor'].includes(user?.user_type);

    return (
        <DeliveryTabs
            initialRouteName="index"
            initialLayout={{
                width: Dimensions.get('window').width,
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
                    tabBarLabel: 'Riders',
                }}
            />
            <DeliveryTabs.Screen
                
                name="delivery"
                options={{
                    tabBarLabel: 'Delivery',

                }}
            />
           
           
            <DeliveryTabs.Screen
                redirect={showAllTabs}
                name="food"
                options={{
                    tabBarLabel: 'Food',
                }}
            />
            <DeliveryTabs.Screen
                redirect={showAllTabs}
                name="laundry"
                options={{
                    tabBarLabel: 'Laundry',
                }}
            />
           
        </DeliveryTabs>
    );
}

export default DeliveryLayout;