import React, { useState } from 'react';
import { View, ScrollView, Text } from 'react-native';
import AppButton from './AppButton';
import SimpleToast from './SimpleToast';

/**
 * Example showing how to use SimpleToast without a provider
 * This is useful if you're having issues with the ToastProvider
 */
const SimpleToastExample = () => {
    const [toast, setToast] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        type?: 'success' | 'error' | 'warning' | 'info';
        customColor?: string;
        duration?: number;
        position?: 'top' | 'bottom';
    }>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const showToast = (config: typeof toast) => {
        setToast({ ...config, visible: true });
    };

    const hideToast = () => {
        setToast(prev => ({ ...prev, visible: false }));
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView className="flex-1 bg-background p-4">
                <Text className="text-2xl font-poppins-bold text-primary mb-6 text-center">
                    Simple Toast Example
                </Text>

                <View className="gap-4">
                    <AppButton
                        title="Show Success Toast"
                        onPress={() => showToast({
                            visible: true,
                            title: 'Success!',
                            message: 'Payment completed successfully',
                            type: 'success'
                        })}
                    />

                    <AppButton
                        title="Show Error Toast"
                        onPress={() => showToast({
                            visible: true,
                            title: 'Error!',
                            message: 'Something went wrong',
                            type: 'error'
                        })}
                    />

                    <AppButton
                        title="Show Warning Toast"
                        onPress={() => showToast({
                            visible: true,
                            title: 'Warning!',
                            message: 'Please check your input',
                            type: 'warning'
                        })}
                    />

                    <AppButton
                        title="Custom Purple Toast"
                        onPress={() => showToast({
                            visible: true,
                            title: 'Custom Color',
                            message: 'This is a purple toast',
                            customColor: '#8B5CF6',
                            duration: 6000
                        })}
                    />

                    <AppButton
                        title="Bottom Position Toast"
                        onPress={() => showToast({
                            visible: true,
                            title: 'Bottom Toast',
                            message: 'This appears at the bottom',
                            type: 'info',
                            position: 'bottom'
                        })}
                    />

                    <AppButton
                        title="Persistent Toast"
                        onPress={() => showToast({
                            visible: true,
                            title: 'Persistent',
                            message: 'This stays until manually dismissed',
                            type: 'warning',
                            duration: 0
                        })}
                    />
                </View>
            </ScrollView>

            {/* Toast component */}
            <SimpleToast
                visible={toast.visible}
                title={toast.title}
                message={toast.message}
                type={toast.type}
                customColor={toast.customColor}
                duration={toast.duration}
                position={toast.position}
                onHide={hideToast}
            />
        </View>
    );
};

export default SimpleToastExample;
