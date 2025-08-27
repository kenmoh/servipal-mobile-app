import { useAuth } from '@/context/authContext'
import { useCartStore } from '@/store/cartStore'
import { MenuItem } from "@/types/item-types"
import Checkbox from 'expo-checkbox'
import { router } from 'expo-router'
import { Edit, Trash } from 'lucide-react-native'
import React from 'react'
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { useToast } from './ToastProvider'


const FoodCard = ({ item, onPress, onDelete }: {
    item: MenuItem,
    onPress: (id: string) => void,
    onDelete?: (id: string) => void
}) => {

    const { user } = useAuth()
    const { showError, showSuccess } = useToast()
    const cartItems = useCartStore(state => state.cart.order_items)
    // Check if item exists in cart
    const isChecked = cartItems.some(cartItem => cartItem.item_id === item.id)

    const isOwner = user?.user_type === 'restaurant_vendor' && user?.sub === item.user_id;


    return (
        <TouchableOpacity disabled={isOwner} onPress={() => onPress(item.id)} className='my-1 p-2 bg-input rounded-md w-[95%] self-center' >

            {/* Edit/Delete buttons for owner */}
            {isOwner && (
                <View className='flex-row absolute top-3 right-3 gap-5 z-10' >
                    <Pressable
                        onPress={() => router.push({
                            pathname: '/restaurant-detail/addMenu',
                            params: {
                                id: item.id,
                                name: item.name,
                                description: item.description,
                                price: item.price,
                                images: JSON.stringify(item.images),
                                item_type: item.item_type,
                            }
                        })}
                        hitSlop={10}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                    >
                        <Edit color='gray' size={18} />
                    </Pressable>
                    <Pressable
                        onPress={() => onDelete ? onDelete(item.id) : () => showError("Success", "Item deleted.")}
                        hitSlop={10}
                        style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                    >
                        <Trash color='rgba(255, 0,0, 0.9)' size={18} />
                    </Pressable>
                </View>
            )}
            <View className='flex-row gap-4'>
                <View className='w-20 h-20 overflow-hidden rounded-lg'>
                    <Image
                        source={{ uri: item?.images[0].url }}
                        style={{
                            height: '100%',
                            width: '100%'
                        }}
                    />
                </View>
                <View className='w-[70%]' >
                    <Text className='text-primary tracking-tight font-poppins-medium text-sm'>
                        {item.name}
                    </Text>
                    <Text
                        className='text-wrap mt-1 text-muted text-sm flex-wrap'

                    >
                        {item.description}
                    </Text>
                    <Text className='mt-2 text-sm font-poppins-bold text-primary' >
                        ₦{Number(item.price).toFixed(2)}
                    </Text>
                </View>
            </View>

            <Checkbox
                style={{ borderWidth: 1, height: 20, width: 20, borderRadius: 3, }}
                className='absolute right-2 bottom-2'
                value={isChecked}
                color={isChecked ? 'orange' : undefined}
                hitSlop={25}
                disabled={isOwner}
                onValueChange={!isOwner ? () => onPress(item.id) : () => showError("Not Allowed", "You cannot order from your own restaurant")}
            >

            </Checkbox>

        </TouchableOpacity>
    )
}

export default FoodCard

