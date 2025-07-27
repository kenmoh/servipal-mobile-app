import { CARD_BG } from "@/constants/theme";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";




interface GoogleTextInputProps {
  placeholder: string;
  handlePress: (lat: number, lng: number, address: string) => void;
  value: string | null;
  isLoading?: boolean;

  onChangeText?: (text: string) => void;
  errorMessage?: string;
  disableScroll?: boolean;
}

const GoogleTextInput = ({
  placeholder,
  handlePress,
  onChangeText,
  value,
  errorMessage,
  disableScroll = false,
  isLoading = false,
}: GoogleTextInputProps) => {
  const theme = useColorScheme();
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<any>(null);

  const TEXT = theme === "dark" ? "white" : "gray";
  const BG_COLOR = theme === "dark" ? "rgba(30, 33, 39, 0.5)" : "#eee";

  useEffect(() => {
    if (value && ref.current) {
      ref.current.setAddressText(value);
    }
  }, [value]);

  return (
    <View style={styles.container}>
      {/*<Text className="text-primary mb-2">{placeholder}</Text>*/}
      <GooglePlacesAutocomplete
        ref={ref}
        placeholder={placeholder}
        disableScroll={disableScroll}
        fetchDetails={true}
        debounce={300}
        predefinedPlaces={[]}
        enablePoweredByContainer={false}
         query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY,
          language: 'en',
          components: 'country:ng',
        }}
        onPress={(data, details = null) => {
          // Remove trailing ", Nigeria" (with or without comma/space)
          console.log(data)
          let address = data?.description.replace(/,? ?Nigeria$/i, "");
          if (details?.geometry?.location) {
            const { lat, lng } = details?.geometry?.location;
            handlePress(lat, lng, address);
            Keyboard.dismiss();
          }
        }}
        keyboardShouldPersistTaps="handled"
        textInputProps={{
          placeholderTextColor: "#aaa",

          onChangeText: onChangeText,
          onFocus: () => setIsFocused(true),
          onBlur: () => setIsFocused(false),
        }}
        styles={{
          container: {
            flex: 0,
            width: "100%",
            zIndex: 1,
          },
          textInput: {
            height: 50,
            backgroundColor: BG_COLOR,
            borderRadius: 12,
            paddingHorizontal: 15,
            fontSize: 14,
            color: TEXT,
            fontFamily: "Poppins-Regular",
            opacity: isLoading ? 0.5 : 1,
            borderWidth: 1,
            borderColor: errorMessage
              ? "red"
              : isFocused
                ? "orange"
                : "transparent",
          },
          listView: {
            backgroundColor: CARD_BG,
            borderRadius: 12,
            marginTop: 0,
          },
          row: {
            backgroundColor: CARD_BG,
            padding: 13,
            height: 50,
            flexDirection: "row",
          },
          separator: {
            height: 0.5,
            width: "95%",
            alignSelf: "center",
            backgroundColor: "#aaa",
          },
          description: {
            color: TEXT,
            fontSize: 11,
            fontFamily: "Poppins-Regular",
          },
        }}
      />

      {isLoading && (
        <ActivityIndicator
          size="small"
          color={"orange"}
          style={styles.loader}
        />
      )}
      {errorMessage && (
        <Text className="text-status-error text-xs mt-1">{errorMessage}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '90%',
    alignSelf: 'center',
    zIndex: 1,
  },

  loader: {
    position: 'absolute',
    right: 15,
    top: 15,
  }
});
// const styles = StyleSheet.create({
//   container: {
//     position: "relative",
//     width: "90%",
//     alignSelf: "center",
//     zIndex: 1,
//   },

//   loader: {
//     position: "absolute",
//     right: 15,
//     top: 15,
//   },
// });

export default GoogleTextInput;
