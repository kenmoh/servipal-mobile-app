import { Transaction } from '@/types/user-types'
import { router } from 'expo-router'
import { ArrowDown, ArrowUp } from 'lucide-react-native'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const Transactioncard = ({ data }: { data: Transaction }) => {

    // Determine circle and icon color
    let circleBg = data?.transaction_direction === 'credit' ? 'rgba(4, 255, 130, 0.1)' : 'rgba(255, 0, 0, 0.2)';
    let iconColor = data?.transaction_direction === 'credit' ? 'green' : 'red';
    if (data?.payment_status === 'pending' && data?.transaction_direction === 'credit') {
        circleBg = 'rgba(255, 193, 7, 0.2)';
        iconColor = '#FFC107';
    }

    return (
        <TouchableOpacity
            hitSlop={25}
            onPress={() => router.push({
                pathname: '/profile/[transactionId]',
                params: {
                    transactionId: data?.id,
                    amount: data.amount,
                    date: data?.created_at,
                    status: data?.payment_status,
                    fromUser: data?.from_user,
                    toUser: data?.to_user,
                    transactionType: data?.transaction_type,
                    transactionDirection: data?.transaction_direction,
                    paymentStatus: data?.payment_status,
                    paymentLink: data?.payment_link
                }
            })}
        >
            <View className="w-[90%] self-center border-b border-border-subtle rounded-none py-3 flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                    <View style={{ backgroundColor: circleBg }} className="w-6 h-6 rounded-full items-center justify-center">
                        {data?.transaction_direction === 'credit'
                            ? <ArrowDown color={iconColor} size={14} />
                            : <ArrowUp color={iconColor} size={12} />}
                    </View>
                    <View>
                        <Text className="capitalize text-xs font-normal text-primary">{data?.from_user}</Text>
                        <Text className="text-muted text-[10px]">{data?.created_at}</Text>
                    </View>
                </View>
                <Text className="text-xs font-bold text-primary">₦ {Number(data?.amount).toFixed(2)}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default Transactioncard

const styles = StyleSheet.create({})