import AppButton from "@/components/AppButton";
import CurrentLocationButton from "@/components/CurrentLocationButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store/locationStore";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View } from "react-native";

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
          value={origin}
          error={errors.origin}
          onChangeText={(text) => {
            setOrigin(text, null);
          }}
          onPlaceSelect={(lat, lng, address) => {
            setOrigin(address, [lat, lng]);
            setErrors((prev) => ({ ...prev, origin: "" }));
            setIsDisabled(false);
          }}
        />

        <GoogleTextInput
          placeholder="Dropoff Location"
          value={destination}
          error={errors.destination}
          onChangeText={(text) => {
            setDestination(text, null);
          }}
          onPlaceSelect={(lat, lng, address) => {
            setDestination(address, [lat, lng]);
            setErrors((prev) => ({ ...prev, destination: "" }));
            setIsDisabled(false);
          }}
        />
      </View>

      <AppButton
        disabled={isDisabled}
        backgroundColor={isDisabled ? "gray" : "orange"}
        onPress={handleNext}
        width="90%"
        title="Next"
      />
    </View>
  );
};

export default SendItem;
