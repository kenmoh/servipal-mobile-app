import React from 'react';
import { ActivityIndicator, DimensionValue, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

interface AppButtonProps {
    label: string;
    onPress?: () => void;
    backgroundColor?: string;
    filled?: boolean;
    outline?: boolean;
    outlineColor?: string;
    height?: number;
    width?: DimensionValue;
    icon?: React.ReactNode;
    isLoading?: boolean;
    disabled?: boolean;
    borderRadius?: number
}

const AppVariantButton: React.FC<AppButtonProps> = ({
    label,
    onPress,
    backgroundColor = 'orange',
    filled = true,
    outline = false,
    outlineColor = '#2f4550',
    height = 45,
    width = '100%',
    icon,
    isLoading = false,
    disabled = false,
    borderRadius = 8
}) => {
    const buttonStyle: ViewStyle = {
        backgroundColor: filled ? backgroundColor : 'transparent',
        height,
        width,
        borderRadius,
        borderWidth: outline ? 1 : 0,
        borderColor: outline ? outlineColor : 'transparent',
    };

    const textStyle: TextStyle = {
        color: filled ? '#ffffff' : backgroundColor,
    };

    return (
        <TouchableOpacity

            onPress={onPress}
            style={[styles.button, buttonStyle]}
            disabled={disabled || isLoading}
        >
            {isLoading ? (
                <ActivityIndicator color={filled ? '#ffffff' : backgroundColor} />
            ) : (
                <View style={styles.content}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[styles.text, textStyle]}>{label}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {

        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        alignSelf: 'center',



    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    iconContainer: {
        marginRight: 8,
    },
    text: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AppVariantButton;
