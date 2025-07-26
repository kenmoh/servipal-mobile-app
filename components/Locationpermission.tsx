import * as Linking from 'expo-linking'
import { MapPin } from 'lucide-react-native'
import { Text, View } from 'react-native'
import AppButton from './AppButton'
// import { Linking } from 'react-native'

interface LocationPermissionProps {
    onRetry: () => void
}

const LocationPermission = ({ onRetry }: LocationPermissionProps) => {

    const handleOpenSettings = async () => {
        await Linking.openSettings()
    }


    return (
        <View
            className='bg-background flex-1 justify-center items-center p-3 gap-4'

        >
            <MapPin size={50} color={'orange'} />
            <Text
                className='text-primary text-center text-lg font-poppins-bold'

            >
                Location Access Required
            </Text>
            <Text
                className='text-primary px-4 text-center text-sm font-poppins-regular'

            >
                Please enable location services to see available deliveries within 30km of your location
            </Text>
            <View className='gap-2 w-full px-6' >
                <AppButton
                    title='Open Settings'
                    onPress={handleOpenSettings}

                />

                <AppButton
                    backgroundColor="gray"
                    onPress={onRetry}
                    title='Retry'

                />

            </View>
        </View>
    )
}

export default LocationPermission