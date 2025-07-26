import AppButton from '@/components/AppButton';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { CheckCircle, Copy, Info } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import type { InitBankTransferResponse } from '../../types/payment';

// Example dummy data for preXStack
const dummyTransfer: InitBankTransferResponse = {
    status: 'success',
    message: 'Bank transfer account generated',
    transfer_reference: 'TRF-20250703-123456',
    account_expiration: '2025-07-04T12:00:00Z',
    transfer_account: '1234567890',
    transfer_bank: 'Zenith Bank',
    transfer_amount: '5000',
    transfer_note: 'SP-ORDER-20250703',
    mode: 'manual',
};

const ProgressBar = ({ status }: { status: string }) => {
    const isSuccess = status === 'success';
    const progress = useSharedValue(0);

    useEffect(() => {
        if (!isSuccess) {
            progress.value = withRepeat(
                withTiming(1, { duration: 1800, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            progress.value = withTiming(1, { duration: 400 });
        }
    }, [isSuccess]);

    const animatedStyle = useAnimatedStyle(() => {
        return !isSuccess
            ? {
                width: progress.value * 160, // progress bar grows from 0 to 100%
            }
            : { width: 160 };
    });

    return (
        <View style={{ width: '90%', alignSelf: 'center', height: 18, marginBottom: 18, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
            <View style={{ width: 160, height: 2, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            height: 2,
                            borderRadius: 8,
                            backgroundColor: '#20BF6B',
                        },
                        animatedStyle,
                    ]}
                />
            </View>
            {isSuccess && (
                <CheckCircle size={18} color="#20BF6B" style={{ marginLeft: 8 }} />
            )}
        </View>
    );
};

const TransferDetailScreen = ({ transfer = dummyTransfer }: { transfer?: InitBankTransferResponse }) => {

    const { data } = useLocalSearchParams()

    const parsedData = data ? JSON.parse(data as string) as InitBankTransferResponse : null;


    const handleCopy = async (value: string) => {
        await Clipboard.setStringAsync(value);
    };

    return (
        <View className='flex-1 bg-background py-6 gap-4 px-3'>
            <ProgressBar status={'success'} />
            <View className='border border-border-subtle rounded-[18px] bg-input p-4 elevation' >
                <View className='flex-row items-center gap-2 mb-4' >
                    <CheckCircle className='text-green-400' size={22} />
                    <Text className='font-poppins-bold text-sm text-green-400'>
                        {parsedData?.status === 'success' ? `${parsedData?.message}` : 'Transfer Pending'}
                    </Text>
                </View>

                <View className='gap-3 mt-2'>
                    <View className='flex-row items-center justify-between'>
                        <Text style={styles.label}>Bank</Text>
                        <Text className='text-primary'>{parsedData?.transfer_bank}</Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text style={styles.label}>Account Number</Text>
                        <View className='gap-2 flex-row'>
                            <Text className='text-primary' >{parsedData?.transfer_account}</Text>
                            <TouchableOpacity onPress={() => handleCopy(parsedData?.transfer_account ?? '')}>
                                <Copy size={18} className='text-icon-default' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text style={styles.label}>Amount</Text>
                        <Text className='text-button-primary' >₦{parsedData?.transfer_amount}</Text>
                    </View>
                    <View className='flex-row items-center justify-between'>
                        <Text style={styles.label}>Reference</Text>
                        <View className='flex-row gap-2'>
                            <Text className='text-primary' >{parsedData?.transfer_reference}</Text>
                            <TouchableOpacity onPress={() => handleCopy(parsedData?.transfer_reference ?? '')}>
                                <Copy size={18} className='text-icon-default' />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className='flex-row items-center justify-between'  >
                        <Text style={styles.label}>Mode</Text>
                        <View>
                            <Text className='text-primary'>{parsedData?.mode}</Text>

                        </View>
                    </View>

                    <View className='flex-row items-center justify-between'>
                        <Text style={styles.label}>Expires</Text>
                        <Text className='text-red-400'>
                            {parsedData?.account_expiration &&
                                (() => {
                                    // Try to parse with Date, fallback to manual parsing
                                    const raw = parsedData.account_expiration;
                                    let dateObj = new Date(raw);
                                    if (isNaN(dateObj.getTime())) {
                                        // Try to convert 'YYYY-MM-DD h:mm:ss AM/PM' to ISO
                                        const match = raw.match(/(\d{4}-\d{2}-\d{2}) (\d{1,2}):(\d{2}):(\d{2}) (AM|PM)/);
                                        if (match) {
                                            let [_, ymd, h, m, s, ap] = match;
                                            let hour = parseInt(h, 10);
                                            if (ap === 'PM' && hour < 12) hour += 12;
                                            if (ap === 'AM' && hour === 12) hour = 0;
                                            // Pad hour
                                            const hourStr = hour.toString().padStart(2, '0');
                                            const iso = `${ymd}T${hourStr}:${m}:${s}`;
                                            dateObj = new Date(iso);
                                        }
                                    }
                                    return !isNaN(dateObj.getTime()) ? dateObj.toLocaleString() : '--';
                                })()
                            }
                        </Text>
                    </View>
                </View>
                <View className='items-center mt-4 gap-2'>
                    <View className='flex-row items-center gap-2'>
                        <Info size={18} className='text-yellow-400' />
                        <Text className='font-poppins-bold text-yellow-400 text-xs'>Important</Text>
                    </View>
                    <Text className='text-gray-400 text-sm'>
                        Please transfer the exact amount to the above account. Use the reference and note as provided. The account will expire at the stated time.
                    </Text>
                </View>
                <AppButton title="I have made the transfer" />

            </View>
        </View>

    );
};

const styles = StyleSheet.create({
    label: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    value: {
        color: '#222',
        fontSize: 15,
        fontWeight: '600',
    },
});

export default TransferDetailScreen;
