import GooglePlacesTextInput from 'react-native-google-places-textinput';

import { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  useColorScheme,
  View
} from "react-native";



interface GoogleTextInputProps {
  placeholder: string;
  onPlaceSelect: (lat: number, lng: number, address: string) => void;
  value: string | null;
  onChangeText?: (text: string) => void;
  error?: string

}


const GoogleTextInput = ({ placeholder, onPlaceSelect, value, error, onChangeText }: GoogleTextInputProps) => {


  const theme = useColorScheme();
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<any>(null);

  const TEXT = theme === "dark" ? "white" : "gray";
  const BG_COLOR = theme === "dark" ? "rgba(30, 33, 39, 0.5)" : "#eee";

  const styles = StyleSheet.create({
    container: {
      width: '90%',
      marginHorizontal: 16,
      alignSelf: 'center',

    },
    suggestionsContainer: {
      backgroundColor: BG_COLOR,
      maxHeight: 350,
      padding: 10,

    },
    suggestionItem: {
      padding: 5,

    },
    suggestionText: {
      main: {
        fontSize: 14,
        color: theme === 'dark' ? 'white' : 'black',
        fontFamily: 'Poppins-Regular'
      },
      secondary: {
        fontSize: 12,
        color: '#888888',
        fontFamily: 'Poppins-Light',
      }
    },

    input: {
      height: 50,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
      color: TEXT,
      fontFamily: 'Poppins-Regular',
      borderColor: isFocused ? 'orange' : BG_COLOR,
      paddingHorizontal: 12,
      fontSize: 14,
      backgroundColor: BG_COLOR,

    },
    loadingIndicator: {
      color: '#aaa'
    },
    placeholder: {
      color: '#888888',
    },
    clearButtonText: {
      color: '#aaa',
      fontSize: 20,
    }
  });

  return (
    <View className='gpa-2'>

      <GooglePlacesTextInput
        apiKey={`${process.env.EXPO_PUBLIC_GOOGLE_MAP_API_KEY}`}
        // onPlaceSelect={handlePlaceSelect}
        ref={ref}
        languageCode="en"
        placeHolderText={placeholder}
        includedRegionCodes={['ng']}
        minCharsToFetch={3}
        onTextChange={onChangeText}
        value={value || undefined}
        style={styles as any}
        fetchDetails={true}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPlaceSelect={(data) => {
          if (data?.details) {
            // Remove trailing ", Nigeria" (with or without comma/space)
            const text = data.details.displayName.text;
            const secondaryText = data.details.formattedAddress.replace(/,? ?Nigeria$/i, "");
            const address = text + ' ' + secondaryText;

            if (data.details.location) {
              const { latitude: lat, longitude: lng } = data.details.location;
              onPlaceSelect(lat, lng, address);
            }
          }
        }}
      />
      {error && <Text className="text-red-500">{error}</Text>}
    </View>
  );
};




export default GoogleTextInput;


