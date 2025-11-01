import Onboarding from '@blazejkustra/react-native-onboarding';
import {useState} from 'react'
import { LinearGradient } from "expo-linear-gradient";
import { HEADER_BG_DARK, HEADER_BG_LIGHT } from "@/constants/theme";
import type { ColorValue } from "react-native";
import {useColorScheme, View, StyleSheet} from 'react-native'
import { useUserStore } from "@/store/userStore";


import { router } from "expo-router";
import { onboardingSlides } from "@/constants/onboarding";

const gradients: ReadonlyArray<readonly [ColorValue, ColorValue, ColorValue, ColorValue, ColorValue]> = [
    [
        "#18191c", "#232526", "#434343", "#5a5a5a", "#7b7b7b"
    ],
    [
        "#2c3e50", "#2c3e50", "#6a89cc", "#b8c6db", "#f5f7fa"
    ],
    [
        "#6a89cc", "#8B5CF6", "#a18cd1", "#fbc2eb", "#f5f7fa"
    ],

    [
        "#fbc2eb", "#f7cac9", "#f5e6e8", "#e3e3e3", "#f5f7fa" 
    ],
    [
        "#a18cd1", "#b8c6db", "#dbe6e4", "#f5f7fa", "#e3e3e3"
    ],
];


function ServipalOnboarding() {
  const theme = useColorScheme();
  const { setFirstLaunchComplete } = useUserStore();
  const [activeStep, setActiveStep] = useState(0)
    const handleFirstLaunch = async () => {
        await setFirstLaunchComplete();
        router.replace("/sign-up");
    };

  return (
    <Onboarding
      introPanel={{
        title: 'Welcome to ServiPal',
        subtitle: 'Let\'s get you started',
        button: 'Get Started',
        image: require('@/assets/images/laundry.png'),
      }}
      steps={onboardingSlides}
     background={()=><CustomBackground activeStep={activeStep}/>}
      onComplete={handleFirstLaunch}
      onSkip={handleFirstLaunch}
      onStepChange={(step) => setActiveStep(step)}
    />
  );
}

export default ServipalOnboarding

function CustomBackground({activeStep}: {activeStep: number}) {
  return (
   <View className="flex-1">
      <LinearGradient
                colors={gradients[activeStep] || gradients[0]}
                style={{ ...StyleSheet.absoluteFillObject, zIndex: 0 }}
                start={{ x: 0.2, y: 0.8 }}
                end={{ x: 0.8, y: 0.2 }}
            />

   </View>
  );
}