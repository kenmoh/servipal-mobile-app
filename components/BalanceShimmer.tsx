import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { Easing, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

const BalanceShimmer = ({ width = 80, height = 24, borderRadius = 8 }) => {
    const shimmer = useSharedValue(0);

    React.useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200, easing: Easing.linear }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            opacity: 0.5 + 0.5 * Math.abs(Math.sin(shimmer.value * Math.PI)),
        };
    });

    return (
        <Animated.View
            style={[
                styles.shimmer,
                { width, height, borderRadius },
                animatedStyle,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    shimmer: {
        backgroundColor: '#ffffff33',
        marginVertical: 2,
    },
});

export default BalanceShimmer;
