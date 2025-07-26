import { StyleSheet, View } from "react-native";

import { DimensionValue } from "react-native";

const HDivider = ({ width = "95%" }: { width?: DimensionValue }) => {
    return (
        <View
            className="bg-background self-center"
            style={{ height: StyleSheet.hairlineWidth, width }}
        />
    );
};

export default HDivider;
