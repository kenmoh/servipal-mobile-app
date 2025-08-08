import { useProductModal } from '@/contexts/ProductModalContext';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import AppVariantButton from './core/AppVariantButton';

const { width, height } = Dimensions.get('window');
const MODAL_WIDTH = width * 0.85;
const MODAL_HEIGHT = height * 0.95;

export const ProductDetailModal = () => {
    const { currentProduct, isVisible, cardPosition, closeModal } = useProductModal();

    const scale = useSharedValue(0);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0);
    const backdropOpacity = useSharedValue(0);
    const panTranslateY = useSharedValue(0);

    // Store card position in shared values for worklet access
    const cardX = useSharedValue(0);
    const cardY = useSharedValue(0);
    const cardWidth = useSharedValue(0);
    const cardHeight = useSharedValue(0);

    // Update card position when it changes
    React.useEffect(() => {
        if (cardPosition.current) {
            cardX.value = cardPosition.current.x;
            cardY.value = cardPosition.current.y;
            cardWidth.value = cardPosition.current.width;
            cardHeight.value = cardPosition.current.height;
        }
    }, [cardPosition.current]);

    const panGesture = Gesture.Pan()
        .onUpdate(event => {
            'worklet';
            if (event.translationY > 0) {
                panTranslateY.value = event.translationY;
                // Gradually scale down and move towards original position as user pans
                const progress = Math.min(event.translationY / 300, 1);

                // Calculate initial position using shared values
                const cardCenterX = cardX.value + cardWidth.value / 2;
                const cardCenterY = cardY.value + cardHeight.value / 2;
                const modalCenterX = width / 2;
                const modalCenterY = height / 2;

                const initialX = cardCenterX - modalCenterX;
                const initialY = cardCenterY - modalCenterY;
                const initialScale = Math.min(cardWidth.value / MODAL_WIDTH, cardHeight.value / MODAL_HEIGHT);

                translateX.value = interpolate(progress, [0, 1], [0, initialX]);
                translateY.value = interpolate(progress, [0, 1], [0, initialY]);
                scale.value = interpolate(progress, [0, 1], [1, initialScale]);
                opacity.value = 1 - progress * 0.3;
                backdropOpacity.value = 0.6 * (1 - progress);
            }
        })
        .onEnd((event) => {
            'worklet';
            if (event.translationY > 100) {
                // Animate back to card position then close
                const cardCenterX = cardX.value + cardWidth.value / 2;
                const cardCenterY = cardY.value + cardHeight.value / 2;
                const modalCenterX = width / 2;
                const modalCenterY = height / 2;

                const initialX = cardCenterX - modalCenterX;
                const initialY = cardCenterY - modalCenterY;
                const initialScale = Math.min(cardWidth.value / MODAL_WIDTH, cardHeight.value / MODAL_HEIGHT);

                translateX.value = withTiming(initialX, { duration: 250 });
                translateY.value = withTiming(initialY, { duration: 250 });
                scale.value = withTiming(initialScale, { duration: 250 });
                opacity.value = withTiming(0, { duration: 250 });
                backdropOpacity.value = withTiming(0, { duration: 250 }, () => {
                    runOnJS(closeModal)();
                });
                panTranslateY.value = withTiming(0, { duration: 250 });
            } else {
                // Spring back to center
                panTranslateY.value = withSpring(0, {
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8,
                });
                translateX.value = withSpring(0, {
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8,
                });
                translateY.value = withSpring(0, {
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8,
                });
                scale.value = withSpring(1, {
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8,
                });
                opacity.value = withSpring(1, {
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8,
                });
                backdropOpacity.value = withSpring(0.6, {
                    damping: 25,
                    stiffness: 400,
                    mass: 0.8,
                });
            }
        });

    // Animate modal visibility
    useAnimatedReaction(
        () => isVisible.value,
        (visible) => {
            'worklet';
            if (visible && cardWidth.value > 0) {
                // Calculate initial position using shared values
                const cardCenterX = cardX.value + cardWidth.value / 2;
                const cardCenterY = cardY.value + cardHeight.value / 2;
                const modalCenterX = width / 2;
                const modalCenterY = height / 2;

                const initialX = cardCenterX - modalCenterX;
                const initialY = cardCenterY - modalCenterY;
                const initialScale = Math.min(cardWidth.value / MODAL_WIDTH, cardHeight.value / MODAL_HEIGHT);

                // Set initial position
                translateX.value = initialX;
                translateY.value = initialY;
                scale.value = initialScale;
                opacity.value = 0;

                // Animate to center
                translateX.value = withSpring(0, {
                    damping: 22,
                    stiffness: 300,
                    mass: 0.8,
                });
                translateY.value = withSpring(0, {
                    damping: 22,
                    stiffness: 300,
                    mass: 0.8,
                });
                scale.value = withSpring(1, {
                    damping: 22,
                    stiffness: 300,
                    mass: 0.8,
                });
                opacity.value = withTiming(1, { duration: 200 });
                backdropOpacity.value = withTiming(0.6, { duration: 300 });
            } else if (!visible) {
                // Animate back to card position
                const cardCenterX = cardX.value + cardWidth.value / 2;
                const cardCenterY = cardY.value + cardHeight.value / 2;
                const modalCenterX = width / 2;
                const modalCenterY = height / 2;

                const initialX = cardCenterX - modalCenterX;
                const initialY = cardCenterY - modalCenterY;
                const initialScale = Math.min(cardWidth.value / MODAL_WIDTH, cardHeight.value / MODAL_HEIGHT);

                translateX.value = withTiming(initialX, { duration: 250 });
                translateY.value = withTiming(initialY, { duration: 250 });
                scale.value = withTiming(initialScale, { duration: 250 });
                opacity.value = withTiming(0, { duration: 250 });
                backdropOpacity.value = withTiming(0, { duration: 250 });
                panTranslateY.value = withTiming(0, { duration: 250 });
            }
        }
    );

    const modalStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value + panTranslateY.value },
                { scale: scale.value },
            ],
            opacity: opacity.value,
        };
    });

    const backdropStyle = useAnimatedStyle(() => {
        return {
            opacity: backdropOpacity.value,
        };
    });

    const containerStyle = useAnimatedStyle(() => {
        return {
            pointerEvents: isVisible.value ? 'auto' : 'none',
        };
    });

    const handleBackdropPress = () => {
        closeModal();
    };

    if (!currentProduct) return null;

    return (
        <Animated.View className="" style={[styles.modalContainer, containerStyle]}>
            {/* Backdrop */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={handleBackdropPress}
            >
                <Animated.View style={[styles.backdropOverlay, backdropStyle]} />
            </TouchableOpacity>

            <GestureDetector gesture={panGesture}>
                <Animated.View className={'bg-background'} style={[styles.modalContent, modalStyle]}>
                    {/* Handle bar */}
                    <View style={styles.handleBar} />

                    {/* Product Image */}
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: currentProduct.images[0]?.url }}
                            style={styles.productImage}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Product Details */}
                    <View className='p-4' >
                        <View className='flex-row justify-between'>
                            <Text className='text-primary font-poppins-bold'>₦ {currentProduct.price}</Text>
                            <Text className='text-muted font-poppins'>Qty: 3</Text>
                            <Text className='text-muted font-poppins px-2 py-1 bg-orange-900/10 rounded-full'>Pending</Text>
                        </View>
                        <Text className='text-muted font-poppins'>{currentProduct.name}</Text>
                        <Text className='text-muted font-poppins'>{currentProduct.name}</Text>
                        <View className='flex-row justify-between'>
                            <Text className='text-muted font-poppins'>Colors:</Text>
                            <View className='flex-row gap-2'>
                                <View className='bg-red-400 w-4 h-4 rounded-full' />
                                <View className='bg-blue-400 w-4 h-4 rounded-full' />
                                <View className='bg-gray-400 w-4 h-4 rounded-full' />
                            </View>
                        </View>
                        <View className='flex-row justify-between'>
                            <Text className='text-muted font-poppins'>Sizes:</Text>
                            <View>
                                <View className='flex-row gap-2'>
                                    <Text className='text-muted font-poppins'>42</Text>
                                    <Text className='text-muted font-poppins'>38</Text>
                                    <Text className='text-muted font-poppins'>44</Text>
                                </View>
                            </View>
                        </View>
                        <Text className='text-muted font-poppins-light'>
                            {currentProduct.description}
                        </Text>
                    </View>
                    <View className='mb-5'>
                        <AppVariantButton label='Ok' onPress={() => console.log('first')} width={'90%'} />
                    </View>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    backdropOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        borderRadius: 20,
        width: MODAL_WIDTH,
        maxHeight: MODAL_HEIGHT,
        padding: 10,


    },
    handleBar: {
        width: 50,
        height: 5,
        backgroundColor: '#D1D5DB',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    imageContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    productImage: {
        width: '100%',
        height: '100%',
    },

    productName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        textAlign: 'center',
    },
    productPrice: {
        fontSize: 24,
        fontWeight: '700',
        color: '#059669',
        marginBottom: 16,
        textAlign: 'center',
    },
    productDescription: {
        fontSize: 15,
        color: '#6B7280',
        lineHeight: 22,
        marginBottom: 20,
        textAlign: 'center',
    },
    additionalInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginVertical: 2,
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
    },
    infoLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    infoValue: {
        fontSize: 15,
        color: '#6B7280',
    },
});
