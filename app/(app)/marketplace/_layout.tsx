import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme'
import { Stack } from 'expo-router'
import { useColorScheme } from 'react-native'



const MarketPlaceLayout = () => {
    const theme = useColorScheme()
    const HEADER_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT

    return (
        <Stack screenOptions={{
            headerTintColor: theme === 'dark' ? 'white' : 'black',
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            headerTitleStyle: {
                fontFamily: 'Poppins-Medium'
            },
            headerStyle: {
                backgroundColor: HEADER_COLOR,

            }

        }}>
            <Stack.Screen name='(market)' options={{
                title: 'P2P MarketPlace',
            }} />
            <Stack.Screen name='add-product' options={{
                title: 'Add Product'
            }} />
        </Stack>
    )

}

export default MarketPlaceLayout