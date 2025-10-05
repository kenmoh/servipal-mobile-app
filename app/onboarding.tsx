import { useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";

import { onboardingSlides } from "@/constants/onboarding";

import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import { useUserStore } from "@/store/userStore";
import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";



const Onboarding = () => {
    const theme = useColorScheme();
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const { checkFirstLaunch, isFirstLaunch, setFirstLaunchComplete } = useUserStore()

    const BG_COLOR = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT

    // Create shared values for each slide's image and text
    const scales = onboardingSlides.map(() => ({
        image: useSharedValue(0.8),
        text: useSharedValue(0)
    }));

    // Animated style for image and text
    const getImageAnimatedStyle = (index: number) => {
        return useAnimatedStyle(() => ({
            transform: [{
                scale: withTiming(scales[index].image.value, {
                    duration: 500,
                    easing: Easing.ease
                })
            }],
            opacity: withTiming(scales[index].image.value === 1 ? 1 : 0.7, {
                duration: 500
            })
        }));
    };

    const getTextAnimatedStyle = (index: number) => {
        return useAnimatedStyle(() => ({
            transform: [{
                translateY: withTiming(scales[index].text.value * 20, {
                    duration: 500,
                    easing: Easing.ease

                })
            }],
            opacity: withTiming(scales[index].text.value, {
                duration: 500
            })
        }));
    };

    const handleIndexChanged = (index: number) => {
        setActiveIndex(index);

        // Reset all scales
        scales.forEach((scale, i) => {
            scale.image.value = i === index ? 1 : 0.8;
            scale.text.value = i === index ? 1 : 0;
        });
    };

    const handleFirstLaunch = async () => {
        if (isFirstLaunch) {
            await setFirstLaunchComplete(); // Mark onboarding complete
            router.replace('/sign-up'); // Show sign-up for first time users
        } else {
            router.replace('/sign-in'); // Show sign-in for returning users
        }
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: BG_COLOR }}>
            <TouchableOpacity
                className="bg-button-primary-transparent"
                activeOpacity={0.6}
                onPress={handleFirstLaunch}
                style={{
                    width: 75,
                    alignItems: 'center',
                    position: 'absolute',
                    top: 50,
                    right: 25,
                    zIndex: 999,

                    paddingVertical: 5,
                    paddingHorizontal: 15,
                    borderRadius: 20
                }}
            >
                <Text className='text-primary font-poppins-medium' style={{

                    fontSize: 14
                }}>
                    Skip
                </Text>
            </TouchableOpacity>

            <Swiper
                showsButtons
                buttonWrapperStyle={{ alignItems: 'flex-end' }}
                ref={swiperRef}
                loop={false}
                dot={
                    <View
                        style={[styles.dot, { backgroundColor: '#ddd', width: 10 }]}
                    />
                }
                activeDot={
                    <View
                        style={[styles.dot, { backgroundColor: BG_COLOR }]}
                    />
                }
                onIndexChanged={handleIndexChanged}
            >
                {onboardingSlides.map((slide, index) => (
                    <View key={slide.id} style={styles.container}>
                        <Animated.View style={[styles.imageContainer, getImageAnimatedStyle(index)]}>
                            <Image
                                src={slide.image}
                                style={styles.image}

                            />
                        </Animated.View>
                        <Animated.View style={[
                            {
                                marginTop: 50,
                                justifyContent: 'center',
                                paddingHorizontal: 20
                            },
                            getTextAnimatedStyle(index)
                        ]}>
                            <Text className="text-primary" style={[
                                styles.titleText,

                            ]}>
                                {slide.name}
                            </Text>
                            <Text className="text-primary" style={[
                                styles.body,

                            ]}>
                                {slide.description}
                            </Text>
                        </Animated.View>
                    </View>
                ))}
            </Swiper>

            {activeIndex === onboardingSlides.length - 1 && (
                <TouchableOpacity
                    activeOpacity={0.6}
                    onPress={handleFirstLaunch}
                    style={{
                        position: 'absolute',
                        bottom: 10,
                        right: 15,
                        zIndex: 999,
                        backgroundColor: 'orange',
                        paddingVertical: 5,
                        paddingHorizontal: 20,
                        borderRadius: 20
                    }}
                >
                    <AntDesign name="check" size={20} />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
};

export default Onboarding;


const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    dot: {
        width: 25,
        height: 10,
        borderRadius: 10,
        marginLeft: 10
    },
    image: {
        width: '100%',
        height: 300,
        objectFit: 'cover'
    },
    titleText: {
        fontFamily: 'Poppins-SemiBold',
        fontSize: 20
    },
    body: {
        fontFamily: 'Poppins-Light',
        fontSize: 14,
        textAlign: 'justify'
    },
    imageContainer: {
        width: '100%',
        height: 300,
        justifyContent: 'center',
        alignItems: 'center'
    },
})