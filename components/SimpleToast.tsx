import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react-native';

export type SimpleToastType = 'success' | 'error' | 'warning' | 'info';

interface SimpleToastProps {
    visible: boolean;
    title: string;
    message?: string;
    type?: SimpleToastType;
    duration?: number;
    onHide: () => void;
    customColor?: string;
    position?: 'top' | 'bottom';
}

/**
 * Simple Toast component that doesn't require a provider
 * Use this if you're having issues with the ToastProvider
 */
const SimpleToast: React.FC<SimpleToastProps> = ({
    visible,
    title,
    message,
    type = 'info',
    duration = 4000,
    onHide,
    customColor,
    position = 'top',
}) => {
    const slideAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
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
        if (visible) {
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
        } else {
            // Reset animations when not visible
            slideAnim.setValue(position === 'top' ? -100 : 100);
            opacityAnim.setValue(0);
        }
    }, [visible, duration]);

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
            onHide();
        });
    };

    if (!visible) {
        return null;
    }

    return (
        <Animated.View
            style={{
                transform: [{ translateY: slideAnim }],
                opacity: opacityAnim,
                position: 'absolute',
                top: position === 'top' ? 60 : undefined,
                bottom: position === 'bottom' ? 60 : undefined,
                left: 16,
                right: 16,
                zIndex: 9999,
            }}
        >
            <View
                style={{
                    backgroundColor: getToastColors(),
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 5,
                }}
            >
                {/* Icon */}
                <View style={{ marginRight: 12, marginTop: 2 }}>
                    {getToastIcon()}
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: '#FFFFFF',
                            fontSize: 16,
                            fontWeight: '600',
                            marginBottom: message ? 4 : 0,
                        }}
                        className="font-poppins-semibold"
                    >
                        {title}
                    </Text>
                    {message && (
                        <Text
                            style={{
                                color: '#FFFFFF',
                                fontSize: 14,
                                opacity: 0.9,
                                lineHeight: 20,
                            }}
                            className="font-poppins"
                        >
                            {message}
                        </Text>
                    )}
                </View>

                {/* Close button */}
                <TouchableOpacity
                    onPress={handleDismiss}
                    style={{
                        padding: 4,
                        marginLeft: 8,
                    }}
                    activeOpacity={0.7}
                >
                    <X color="#FFFFFF" size={16} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

export default SimpleToast;
