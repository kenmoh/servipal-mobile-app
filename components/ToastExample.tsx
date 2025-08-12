import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import AppButton from './AppButton';
import { useToast } from './ToastProvider';
import { useSimpleToast } from '@/hooks/useSimpleToast';
import Toast from './Toast';

/**
 * Example component demonstrating how to use the Toast system
 * This is for demonstration purposes - you can delete this file after understanding the usage
 */

// Method 1: Using ToastProvider (Recommended for app-wide toasts)
export const ToastProviderExample = () => {
    const { showSuccess, showError, showWarning, showInfo, showToast } = useToast();

    return (
        <ScrollView className="flex-1 bg-background p-4">
            <Text className="text-2xl font-poppins-bold text-primary mb-6 text-center">
                Toast Provider Example
            </Text>

            <View className="gap-4">
                <AppButton
                    title="Show Success Toast"
                    onPress={() => showSuccess(
                        'Success!', 
                        'Your operation completed successfully'
                    )}
                />

                <AppButton
                    title="Show Error Toast"
                    onPress={() => showError(
                        'Error!', 
                        'Something went wrong. Please try again.'
                    )}
                />

                <AppButton
                    title="Show Warning Toast"
                    onPress={() => showWarning(
                        'Warning!', 
                        'Please check your input and try again'
                    )}
                />

                <AppButton
                    title="Show Info Toast"
                    onPress={() => showInfo(
                        'Info', 
                        'Here is some useful information for you'
                    )}
                />

                <AppButton
                    title="Custom Toast (Purple, 8 seconds)"
                    onPress={() => showToast({
                        title: 'Custom Toast',
                        message: 'This is a custom colored toast with longer duration',
                        customColor: '#8B5CF6',
                        duration: 8000,
                        position: 'top'
                    })}
                />

                <AppButton
                    title="Bottom Position Toast"
                    onPress={() => showToast({
                        title: 'Bottom Toast',
                        message: 'This toast appears at the bottom',
                        type: 'info',
                        position: 'bottom'
                    })}
                />

                <AppButton
                    title="No Auto Dismiss (duration: 0)"
                    onPress={() => showToast({
                        title: 'Persistent Toast',
                        message: 'This toast stays until manually dismissed',
                        type: 'warning',
                        duration: 0
                    })}
                />
            </View>
        </ScrollView>
    );
};

// Method 2: Using Simple Toast Hook (For single-screen usage)
export const SimpleToastExample = () => {
    const {
        toasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        dismissToast,
        dismissAllToasts
    } = useSimpleToast();

    return (
        <View className="flex-1 bg-background p-4">
            <Text className="text-2xl font-poppins-bold text-primary mb-6 text-center">
                Simple Toast Hook Example
            </Text>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                    <AppButton
                        title="Show Success Toast"
                        onPress={() => showSuccess('Success!', 'Operation completed')}
                    />

                    <AppButton
                        title="Show Error Toast"
                        onPress={() => showError('Error!', 'Something went wrong')}
                    />

                    <AppButton
                        title="Show Warning Toast"
                        onPress={() => showWarning('Warning!', 'Please be careful')}
                    />

                    <AppButton
                        title="Show Info Toast"
                        onPress={() => showInfo('Info', 'Useful information')}
                    />

                    <AppButton
                        title="Dismiss All Toasts"
                        onPress={dismissAllToasts}
                    />
                </View>
            </ScrollView>

            {/* Render toasts */}
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
                {toasts.map((toast, index) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        onDismiss={() => dismissToast(toast.id!)}
                        style={{
                            transform: [{ translateY: index * 80 }],
                        }}
                    />
                ))}
            </View>
        </View>
    );
};

export default ToastProviderExample;
