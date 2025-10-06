import { StyleSheet, useColorScheme, View } from "react-native";

import { DimensionValue } from "react-native";

const HDivider = ({ width = "100%" }: { width?: DimensionValue }) => {
  const theme = useColorScheme();
  const color = theme === "dark" ? "#333" : "#ddd";
  return (
    <View
      className="bg-gray-800 self-center"
      style={{
        height: StyleSheet.hairlineWidth,
        width,
        backgroundColor: color,

      }}
    />
  );
};

export default HDivider;
