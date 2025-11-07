import React from "react"

import { TouchableOpacity, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"


interface AppHeaderProps {

    icon?: React.ReactNode
    component?: React.ReactNode
    onPress?: () => void
}

const AppHeader = ({ icon, component, onPress }: AppHeaderProps) => {

    return (
        <SafeAreaView className="bg-background" style={{
            height: 70,
            alignItems: 'center',
            justifyContent: 'center',

        }}>
            <View className='flex-row justify-around gap-[15px] w-full self-center items-center' >
                {icon &&
                    <View className="rounded-full p-1 h-2 w-2">
                        <TouchableOpacity
                            hitSlop={50}
                            onPress={onPress} >
                            {icon}
                        </TouchableOpacity>
                    </View>
                }
                {component}
            </View>
        </SafeAreaView>

    )
}

export default AppHeader