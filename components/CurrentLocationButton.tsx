import { useLocationStore } from "@/store/locationStore";
import { MapPin } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

interface CurrentLocationButtonProps {
  onLocationSet?: (address: string, coords: [number, number]) => void;
}

const CurrentLocationButton = ({
  onLocationSet,
}: CurrentLocationButtonProps) => {
  const theme = useColorScheme();
  const getCurrentLocation = useLocationStore(
    (state) => state.getCurrentLocation
  );
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    const location = await getCurrentLocation();

    setLoading(false);
    if (location && onLocationSet) {
      onLocationSet(location.address, location.coords);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} disabled={loading}>
      <View className="flex-row items-center justify-center bg-profile-card ml-5 gap-2 p-3 rounded-full w-[50%]">
        <MapPin size={16} color={"orange"} />
        {loading ? (
          <ActivityIndicator size="small" color={"orange"} />
        ) : (
          <Text className="text-xs text-primary">Use current location</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CurrentLocationButton;
