import { ChevronRight } from 'lucide-react-native'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

interface ProfileCardProp {
    name: string
    icon: React.ReactNode
    bgColor: string
    onPress: () => void
}

const ProfileCard = ({ name, icon, bgColor, onPress }: ProfileCardProp) => {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
            <View className="bg-profile-card my-1 py-3 px-4 w-[90%] self-center rounded-xl">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                        <View style={{ backgroundColor: bgColor }} className="rounded-full p-2 w-10 h-10 items-center justify-center">
                            {icon}
                        </View>
                        <Text className="text-primary font-poppins text-base">{name}</Text>
                    </View>
                    <ChevronRight size={25} color="#9BA1A6" />
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default ProfileCard

