import AppButton from "@/components/AppButton";
import CurrentLocationButton from "@/components/CurrentLocationButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store/locationStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

const SendItem = () => {
  const { origin, destination, setOrigin, setDestination } = useLocationStore();
  const [errors, setErrors] = useState({ origin: "", destination: "" });
  const [isDisabled, setIsDisabled] = useState(false);

  const router = useRouter();

  const handleNext = () => {
    // Reset errors
    setErrors({ origin: "", destination: "" });
    setIsDisabled(false);

    // Validate inputs
    if (!origin) {
      setErrors((prev) => ({ ...prev, origin: "Pickup location is required" }));
      setIsDisabled(true);
      return;
    }
    if (!destination) {
      setErrors((prev) => ({
        ...prev,
        destination: "Dropoff location is required",
      }));
      setIsDisabled(true);

      return;
    }

    router.push("/delivery/itemInfo");
  };

  useEffect(() => {
    if (origin && destination) {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
    }
  }, [origin, destination]);

  return (
    // <KeyboardAvoidingView
    //   behavior={"padding"}
    //   keyboardVerticalOffset={100}
    //   style={{ flex: 1, maxHeight: 600 }}
    // >
      <View className="bg-background flex-1">
        <View className="my-6 gap-6 ">
          <CurrentLocationButton
            onLocationSet={(address, coords) => {
              setOrigin(address, coords);
              setErrors((prev) => ({ ...prev, origin: "" }));
              setIsDisabled(false);
            }}
          />
          <GoogleTextInput
            placeholder="Pickup Location"
            errorMessage={errors.origin}
            value={origin}
            onChangeText={() => {}}
            handlePress={(lat, lng, address) => {
              setOrigin(address, [lat, lng]);
              setErrors((prev) => ({ ...prev, origin: "" }));
              setIsDisabled(false);
            }}
          />

          <GoogleTextInput
            placeholder="Dropoff Location"
            value={destination}
            errorMessage={errors.destination}
            onChangeText={() => {}}
            handlePress={(lat, lng, address) => {
              setDestination(address, [lat, lng]);
              setErrors((prev) => ({ ...prev, destination: "" }));
              setIsDisabled(false);
            }}
          />
        </View>

        <AppButton
          disabled={isDisabled}
          onPress={handleNext}
          width="90%"
          title="Next"
        />
      </View>
    // </KeyboardAvoidingView>
  );
};

export default SendItem;


// const testApiKey = async () => {
//   const testUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=Ajah&key=${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`;
//   try {
//     const response = await fetch(testUrl);
//     const data = await response.json();
//     console.log('API Test Result:', data);
//   } catch (error) {
//     console.error('API Test Error:', error);
//   }
// };


// testApiKey().then(k=> console.log(k))