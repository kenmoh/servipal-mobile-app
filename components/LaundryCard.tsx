import { useAuth } from '@/context/authContext'
import { useCartStore } from '@/store/cartStore'
import { LaundryMenuItem } from "@/types/item-types"
import Checkbox from 'expo-checkbox'
import { router } from 'expo-router'
import { Edit, Trash } from 'lucide-react-native'
import React from 'react'
import { Image, Pressable, Text, TouchableOpacity, View } from 'react-native'
import { Notifier, NotifierComponents } from 'react-native-notifier'

const LaundryCard = ({ item, onPress, onDelete }: {
    item: LaundryMenuItem,
    onPress: (item: LaundryMenuItem) => void,
    onDelete?: (id: string) => void
}) => {

    const { user } = useAuth()
    const cartItems = useCartStore(state => state.cart.order_items)

    // Check if item exists in cart
    const isChecked = cartItems.some(cartItem => cartItem.item_id === item.id)

    const isOwner = user?.user_type === 'laundry_vendor' && user?.sub === item.user_id;


    return (
        <>

            <TouchableOpacity onPress={() => onPress(item)} disabled={isOwner}>

                <View
                    className='my-1 p-2 bg-profile-card rounded-md'


                >
                    {/* Edit/Delete buttons for owner */}
                    {isOwner && (
                        <View className='absolute top-[10px] right-[10px] z-10 gap-2 flex-row' >
                            <Pressable
                                onPress={() => router.push({
                                    pathname: '/laundry-detail/addLaundryItem',
                                    params: {
                                        id: item.id,
                                        name: item.name,
                                        price: item.price,
                                        images: JSON.stringify(item.images),
                                        item_type: item.item_type,
                                    }
                                })}
                                hitSlop={10}
                                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                            >
                                <Edit className='text-icon-default' />
                            </Pressable>
                            <Pressable
                                onPress={() => onDelete ? onDelete(item.id) : Notifier.showNotification({
                                    title: "Delete",
                                    description: "Item deleted successfully.",
                                    Component: NotifierComponents.Alert,
                                    duration: 2000,
                                    componentProps: { alertType: "warn" },
                                })}
                                hitSlop={10}
                                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                            >
                                <Trash className='text-status-error' size={15} />
                            </Pressable>
                        </View>
                    )}
                    <View className='flex-row gap-$4 gap-3'>
                        <View className='overflow-hidden h-[80px] w-[80px] rounded-[10px] flex-shrink-0'>
                            <Image
                                source={{ uri: item?.images?.[0]?.url || 'https://via.placeholder.com/80x80?text=No+Image' }}
                                style={{
                                    height: '100%',
                                    width: '100%'
                                }}
                            />
                        </View>
                        <View className='w-[70%] self-center justify-center ' >
                            <Text className='text-xsleading-[3px] font-poppins text-primary' >
                                {item?.name}
                            </Text>

                            <Text className='mt-2 text-sm font-poppins-bold text-primary'>
                                ₦{Number(item?.price).toFixed(2)}
                            </Text>
                        </View>
                    </View>
                    <Checkbox
                        style={{ borderWidth: 1, height: 20, width: 20, borderRadius: 3 }}
                        className='absolute right-2 bottom-2'
                        value={isChecked}
                        hitSlop={25}
                        disabled={isOwner}
                        onValueChange={!isOwner ? () => onPress(item) : () => Notifier.showNotification({
                            title: "Not Allowed",
                            description: "You cannot order from your own laundry",
                            Component: NotifierComponents.Alert,
                            duration: 3000,
                            componentProps: {
                                alertType: "warn",
                            },
                        })}
                    >

                    </Checkbox>
                </View>
            </TouchableOpacity>
        </>
    )
}

export default LaundryCard

