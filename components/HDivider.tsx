import { StyleSheet, useColorScheme, View } from "react-native";

import { DimensionValue } from "react-native";

const HDivider = ({ width = "100%" }: { width?: DimensionValue }) => {
  const theme = useColorScheme();
  const color = theme === "dark" ? "rgba(30, 33, 39,1)" : "#aaa";
  return (
    <View
      className="bg-background self-center"
      style={{
        height: StyleSheet.hairlineWidth,
        width,
        backgroundColor: color,
      }}
    />
  );
};

export default HDivider;
