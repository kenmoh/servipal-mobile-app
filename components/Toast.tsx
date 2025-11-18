import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react-native';
import { styled } from 'nativewind';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
    id?: string;
    title: string;
    message?: string;
    type?: ToastType;
    duration?: number;
    onDismiss?: () => void;
    customColor?: string;
    position?: 'top' | 'bottom';
}

const Toast: React.FC<ToastProps> = ({
    title,
    message,
    type = 'info',
    duration = 3000,
    onDismiss,
    customColor,
    position = 'top',
}) => {
    const slideAnim = useRef(new Animated.Value(-100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    const getToastColors = () => {
        if (customColor) return customColor;
        
        switch (type) {
            case 'success':
                return '#10B981'; // green-500
            case 'error':
                return '#EF4444'; // red-500
            case 'warning':
                return '#F59E0B'; // amber-500
            case 'info':
            default:
                return '#3B82F6'; // blue-500
        }
    };

    const getToastIcon = () => {
        const iconColor = '#FFFFFF';
        const iconSize = 20;

        switch (type) {
            case 'success':
                return <CheckCircle color={iconColor} size={iconSize} />;
            case 'error':
                return <AlertCircle color={iconColor} size={iconSize} />;
            case 'warning':
                return <AlertCircle color={iconColor} size={iconSize} />;
            case 'info':
            default:
                return <Info color={iconColor} size={iconSize} />;
        }
    };

    useEffect(() => {
        // Animate in
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Auto dismiss
        if (duration > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration]);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: position === 'top' ? -100 : 100,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDismiss?.();
        });
    };

    return (
        <Animated.View
            style={{
                transform: [{ translateY: slideAnim }],
                position: 'absolute',
                top: position === 'top' ? 60 : undefined,
                bottom: position === 'bottom' ? 60 : undefined,
                left: 16,
                right: 16,
                zIndex: 9999,
            }}
        >
            <View
                className="bg-background rounded-xl p-4 flex-row items-start"
            >
                {/* Icon */}
                <View className="mr-3 mt-1">
                    {getToastIcon()}
                </View>

                {/* Content */}
                <View className="flex-1">
                    <Text
                        className="text-primary font-poppins-semibold text-base mb-1"
                    >
                        {title}
                    </Text>
                    {message && (
                        <Text
                            className="text-muted font-poppins text-xs leading-5"
                        >
                            {message}
                        </Text>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

export default Toast;
